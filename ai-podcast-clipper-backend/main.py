"""
AI Podcast Clipper Backend - Modal GPU Service
=============================================

This service processes podcast videos to extract vertical clips with subtitles.
It uses GPU acceleration for transcription, speaker detection, and video processing.

Key Features:
- Whisper-based transcription for accurate timestamps
- Gemini AI for intelligent clip moment identification
- Active Speaker Detection (ASD) for speaker-focused cropping
- Automatic vertical video generation with subtitles
- S3 integration for file storage

Author: Deepak Singhal
"""

# Standard library imports
import glob
import json
import pathlib
import pickle
import shutil
import subprocess
import time
import uuid
import os

# Third-party imports
import boto3
import cv2
import ffmpegcv
import modal
import numpy as np
import pysubs2
import whisper
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google import genai
from pydantic import BaseModel
from tqdm import tqdm


class ProcessVideoRequest(BaseModel):
    """Request model for video processing endpoint"""
    s3_key: str  # S3 key of the uploaded video file
    max_clips: int = 10  # Maximum number of clips to generate


# Modal container image configuration with GPU support
image = (modal.Image.from_registry(
    "nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.12")
    .apt_install(["ffmpeg", "libgl1-mesa-glx", "wget", "libcudnn8", "libcudnn8-dev"])
    .pip_install_from_requirements("requirements.txt")
    .run_commands(["mkdir -p /usr/share/fonts/truetype/custom",
                   "wget -O /usr/share/fonts/truetype/custom/Anton-Regular.ttf https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf",
                   "fc-cache -f -v"])
    .add_local_dir("asd", "/asd", copy=True))

# Modal application and storage configuration
app = modal.App("ai-podcast-clipper", image=image)
volume = modal.Volume.from_name("ai-podcast-clipper-model-cache", create_if_missing=True)
mount_path = "/root/.cache/torch"
auth_scheme = HTTPBearer()


def create_vertical_video(tracks, scores, pyframes_path, pyavi_path, audio_path, output_path, framerate=25):
    """
    Creates a vertical video (1080x1920) from speaker tracking data.
    
    This function processes face tracking data to create a vertical format video
    suitable for social media platforms. It intelligently crops around the most
    active speaker or applies a resize with blurred background when no speaker is detected.
    
    Args:
        tracks: Speaker tracking data from ASD model
        scores: Speaker activity scores for each track
        pyframes_path: Path to extracted video frames
        pyavi_path: Path for temporary video files
        audio_path: Path to audio file
        output_path: Path for final video output
        framerate: Video framerate (default: 25)
    """
    # Target dimensions for vertical video (9:16 aspect ratio)
    target_width = 1080
    target_height = 1920

    # Get all frame files and sort them chronologically
    flist = glob.glob(os.path.join(pyframes_path, "*.jpg"))
    flist.sort()

    # Initialize face data structure for each frame
    faces = [[] for _ in range(len(flist))]

    # Process tracking data to extract face positions and scores
    for tidx, track in enumerate(tracks):
        score_array = scores[tidx]
        for fidx, frame in enumerate(track["track"]["frame"].tolist()):
            # Calculate average score over a window for smoothing
            slice_start = max(fidx - 30, 0)
            slice_end = min(fidx + 30, len(score_array))
            score_slice = score_array[slice_start:slice_end]
            avg_score = float(np.mean(score_slice) if len(score_slice) > 0 else 0)

            # Store face data for this frame
            faces[frame].append({
                'track': tidx, 
                'score': avg_score, 
                's': track['proc_track']["s"][fidx], 
                'x': track['proc_track']["x"][fidx], 
                'y': track['proc_track']["y"][fidx]
            })

    temp_video_path = os.path.join(pyavi_path, "video_only.mp4")

    # Process each frame to create vertical video
    vout = None
    for fidx, fname in tqdm(enumerate(flist), total=len(flist), desc="Creating vertical video"):
        img = cv2.imread(fname)
        if img is None:
            continue

        current_faces = faces[fidx]

        # Find the face with highest activity score
        max_score_face = max(
            current_faces, key=lambda face: face['score']) if current_faces else None

        # Filter out faces with negative scores (inactive speakers)
        if max_score_face and max_score_face['score'] < 0:
            max_score_face = None

        # Initialize video writer on first frame
        if vout is None:
            vout = ffmpegcv.VideoWriterNV(
                file=temp_video_path,
                codec=None,
                fps=framerate,
                resize=(target_width, target_height)
            )

        # Decide processing mode based on speaker detection
        if max_score_face:
            mode = "crop"  # Crop around active speaker
        else:
            mode = "resize"  # Use blurred background resize

        if mode == "resize":
            # Mode 1: No active speaker - create blurred background with centered content
            
            # Scale image to fit width while maintaining aspect ratio
            scale = target_width / img.shape[1]
            resized_height = int(img.shape[0] * scale)
            resized_image = cv2.resize(
                img, (target_width, resized_height), interpolation=cv2.INTER_AREA)

            # Create blurred background to fill vertical space
            scale_for_bg = max(
                target_width / img.shape[1], target_height / img.shape[0])
            bg_width = int(img.shape[1] * scale_for_bg)
            bg_heigth = int(img.shape[0] * scale_for_bg)

            blurred_background = cv2.resize(img, (bg_width, bg_heigth))
            blurred_background = cv2.GaussianBlur(
                blurred_background, (121, 121), 0)

            # Center crop the blurred background
            crop_x = (bg_width - target_width) // 2
            # Center crop the blurred background
            crop_y = (bg_heigth - target_height) // 2
            blurred_background = blurred_background[crop_y:crop_y +
                                                    target_height, crop_x:crop_x + target_width]

            # Overlay the original content on blurred background
            center_y = (target_height - resized_height) // 2
            blurred_background[center_y:center_y +
                               resized_height, :] = resized_image

            vout.write(blurred_background)

        elif mode == "crop":
            # Mode 2: Active speaker detected - crop around speaker
            
            # Scale image to fit target height
            scale = target_height / img.shape[0]
            resized_image = cv2.resize(
                img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
            frame_width = resized_image.shape[1]

            # Calculate crop position centered on the speaker
            center_x = int(
                max_score_face["x"] * scale if max_score_face else frame_width // 2)
            top_x = max(min(center_x - target_width // 2,
                        frame_width - target_width), 0)

            # Crop the image to target dimensions
            image_cropped = resized_image[0:target_height,
                                          top_x:top_x + target_width]

            vout.write(image_cropped)

    # Release video writer
    if vout:
        vout.release()

    # Combine video with audio using FFmpeg
    ffmpeg_command = (f"ffmpeg -y -i {temp_video_path} -i {audio_path} "
                      f"-c:v h264 -preset fast -crf 23 -c:a aac -b:a 128k "
                      f"{output_path}")
    subprocess.run(ffmpeg_command, shell=True, check=True, text=True)


def create_subtitles_with_ffmpeg(transcript_segments: list, clip_start: float, clip_end: float, clip_video_path: str, output_path: str, max_words: int = 5):
    """
    Creates stylized subtitles for a video clip using FFmpeg and ASS format.
    
    This function generates professional-looking subtitles with custom styling
    and intelligent text chunking for optimal readability on vertical videos.
    
    Args:
        transcript_segments: List of transcript segments with timing
        clip_start: Start time of the clip in seconds
        clip_end: End time of the clip in seconds
        clip_video_path: Path to the input video file
        output_path: Path for the output video with subtitles
        max_words: Maximum words per subtitle line (default: 5)
    """
    temp_dir = os.path.dirname(output_path)
    subtitle_path = os.path.join(temp_dir, "temp_subtitles.ass")

    # Filter transcript segments that overlap with the clip timeframe
    clip_segments = [segment for segment in transcript_segments
                     if segment.get("start") is not None
                     and segment.get("end") is not None
                     and segment.get("end") > clip_start
                     and segment.get("start") < clip_end
                     ]

    subtitles = []

    for segment in clip_segments:
        text = segment.get("text", "").strip()
        seg_start = segment.get("start")
        seg_end = segment.get("end")

        if not text or seg_start is None or seg_end is None:
            continue

        start_rel = max(0.0, seg_start - clip_start)
        end_rel = max(0.0, seg_end - clip_start)

        if end_rel <= 0:
            continue

        # Split long sentences into chunks if needed
        words = text.split()
        if len(words) <= max_words:
            subtitles.append((start_rel, end_rel, text))
        else:
            # Split sentence into chunks of max_words
            duration = end_rel - start_rel
            words_per_chunk = max_words
            num_chunks = len(words) // words_per_chunk + (1 if len(words) % words_per_chunk else 0)
            chunk_duration = duration / num_chunks
            
            for i in range(0, len(words), words_per_chunk):
                chunk_words = words[i:i + words_per_chunk]
                chunk_start = start_rel + (i // words_per_chunk) * chunk_duration
                chunk_end = min(end_rel, chunk_start + chunk_duration)
                subtitles.append((chunk_start, chunk_end, ' '.join(chunk_words)))

    subs = pysubs2.SSAFile()

    subs.info["WrapStyle"] = 0
    subs.info["ScaledBorderAndShadow"] = "yes"
    subs.info["PlayResX"] = 1080
    subs.info["PlayResY"] = 1920
    subs.info["ScriptType"] = "v4.00+"

    style_name = "Default"
    new_style = pysubs2.SSAStyle()
    new_style.fontname = "Anton"
    new_style.fontsize = 140
    new_style.primarycolor = pysubs2.Color(255, 255, 255)
    new_style.outline = 2.0
    new_style.shadow = 2.0
    new_style.shadowcolor = pysubs2.Color(0, 0, 0, 128)
    new_style.alignment = 2
    new_style.marginl = 50
    new_style.marginr = 50
    new_style.marginv = 50
    new_style.spacing = 0.0

    subs.styles[style_name] = new_style

    for i, (start, end, text) in enumerate(subtitles):
        start_time = pysubs2.make_time(s=start)
        end_time = pysubs2.make_time(s=end)
        line = pysubs2.SSAEvent(
            start=start_time, end=end_time, text=text, style=style_name)
        subs.events.append(line)

    subs.save(subtitle_path)

    ffmpeg_cmd = (f"ffmpeg -y -i {clip_video_path} -vf \"ass={subtitle_path}\" "
                  f"-c:v h264 -preset fast -crf 23 {output_path}")

    subprocess.run(ffmpeg_cmd, shell=True, check=True)


def process_clip(base_dir: str, original_video_path: str, s3_key: str, start_time: float, end_time: float, clip_index: int, transcript_segments: list):
    clip_name = f"clip_{clip_index}"
    s3_key_dir = os.path.dirname(s3_key)
    output_s3_key = f"{s3_key_dir}/{clip_name}.mp4"
    print(f"Output S3 key: {output_s3_key}")

    clip_dir = base_dir / clip_name
    clip_dir.mkdir(parents=True, exist_ok=True)

    clip_segment_path = clip_dir / f"{clip_name}_segment.mp4"
    vertical_mp4_path = clip_dir / "pyavi" / "video_out_vertical.mp4"
    subtitle_output_path = clip_dir / "pyavi" / "video_with_subtitles.mp4"

    (clip_dir / "pywork").mkdir(exist_ok=True)
    pyframes_path = clip_dir / "pyframes"
    pyavi_path = clip_dir / "pyavi"
    audio_path = clip_dir / "pyavi" / "audio.wav"

    pyframes_path.mkdir(exist_ok=True)
    pyavi_path.mkdir(exist_ok=True)

    duration = end_time - start_time
    cut_command = (f"ffmpeg -i {original_video_path} -ss {start_time} -t {duration} "
                   f"{clip_segment_path}")
    subprocess.run(cut_command, shell=True, check=True,
                   capture_output=True, text=True)

    extract_cmd = f"ffmpeg -i {clip_segment_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path}"
    subprocess.run(extract_cmd, shell=True,
                   check=True, capture_output=True)

    shutil.copy(clip_segment_path, base_dir / f"{clip_name}.mp4")

    columbia_command = (f"python Columbia_test.py --videoName {clip_name} "
                        f"--videoFolder {str(base_dir)} "
                        f"--pretrainModel weight/finetuning_TalkSet.model")

    columbia_start_time = time.time()
    subprocess.run(columbia_command, cwd="/asd", shell=True)
    columbia_end_time = time.time()
    print(
        f"Columbia script completed in {columbia_end_time - columbia_start_time:.2f} seconds")

    tracks_path = clip_dir / "pywork" / "tracks.pckl"
    scores_path = clip_dir / "pywork" / "scores.pckl"
    if not tracks_path.exists() or not scores_path.exists():
        raise FileNotFoundError("Tracks or scores not found for clip")

    with open(tracks_path, "rb") as f:
        tracks = pickle.load(f)

    with open(scores_path, "rb") as f:
        scores = pickle.load(f)

    cvv_start_time = time.time()
    create_vertical_video(
        tracks, scores, pyframes_path, pyavi_path, audio_path, vertical_mp4_path
    )
    cvv_end_time = time.time()
    print(
        f"Clip {clip_index} vertical video creation time: {cvv_end_time - cvv_start_time:.2f} seconds")

    create_subtitles_with_ffmpeg(transcript_segments, start_time,
                                 end_time, vertical_mp4_path, subtitle_output_path, max_words=5)

    s3_client = boto3.client("s3")
    s3_client.upload_file(
        subtitle_output_path, "ai-podcast-clipper-dev", output_s3_key)


@app.cls(gpu="L40S", timeout=1800, scaledown_window=20, secrets=[modal.Secret.from_name("ai-podcast-clipper-secret")], volumes={mount_path: volume})
class AiPodcastClipper:
    """
    Main AI Podcast Clipper service class running on Modal GPU infrastructure.
    
    This class handles the complete video processing pipeline:
    1. Video transcription using Whisper
    2. Clip moment identification using Gemini AI
    3. Active speaker detection and vertical video creation
    4. Subtitle generation and S3 upload
    
    Configured with:
    - L40S GPU for fast processing
    - 30-minute timeout for long videos
    - Secure environment with API keys
    - Persistent model cache volume
    """
    
    @modal.enter()
    def load_model(self):
        """Initialize AI models when container starts"""
        print("Loading models")

        # Load Whisper model for speech-to-text transcription
        self.whisper_model = whisper.load_model("large")
        print("Transcription models loaded...")

        # Initialize Gemini AI client for clip moment detection
        print("Creating gemini client...")
        self.gemini_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
        print("Created gemini client...")

    def transcribe_video(self, base_dir: str, video_path: str) -> str:
        """
        Transcribe video audio using Whisper model.
        
        Args:
            base_dir: Working directory for temporary files
            video_path: Path to input video file
            
        Returns:
            JSON string containing transcript segments with timestamps
        """
        audio_path = base_dir / "audio.wav"
        
        # Extract audio from video in format suitable for Whisper
        extract_cmd = f"ffmpeg -i {video_path} -vn -acodec pcm_s16le -ar 16000 -ac 1 {audio_path}"
        subprocess.run(extract_cmd, shell=True, check=True, capture_output=True)

        print("Starting transcription with Whisper...")
        start_time = time.time()

        # Perform transcription with timestamp detection
        result = self.whisper_model.transcribe(str(audio_path))

        duration = time.time() - start_time
        print("Transcription took " + str(duration) + " seconds")

        segments = []

        # Extract sentence-level timestamps from Whisper result
        if "segments" in result:
            for segment in result["segments"]:
                segments.append({
                    "start": segment.get("start", 0),
                    "end": segment.get("end", 0),
                    "text": segment.get("text", "").strip(),
                })

        return json.dumps(segments)

    def identify_moments(self, transcript: dict):
        """
        Use Gemini AI to identify optimal 30-60 second clip moments from transcript.
        
        This function analyzes the podcast transcript to find compelling segments
        that would make good standalone clips, focusing on complete Q&A pairs
        and interesting stories.
        
        Args:
            transcript: Dictionary containing transcript segments with timestamps
            
        Returns:
            JSON string with list of clip moments [{"start": seconds, "end": seconds}]
        """
        response = self.gemini_client.models.generate_content(model="models/gemini-1.5-flash", contents="""
This is a podcast video transcript consisting of sentences, along with each sentence's start and end time. I am looking to create clips that are EXACTLY 30-60 seconds long. Each clip MUST be exactly 30-60 seconds - no more, no less.

Your task is to find and extract stories, or question and their corresponding answers from the transcript.
Each clip should begin with the question and conclude with the answer.

CRITICAL RULES - MUST BE FOLLOWED:
- Each clip MUST be exactly 30-60 seconds. Calculate: end_time - start_time MUST be = 30-60 seconds
- Find segments that are naturally around 30-60 seconds, or adjust the boundaries to make them exactly 30 seconds
- Ensure that clips do not overlap with one another
- Start and end timestamps of the clips should align with sentence boundaries in the transcript
- Only use the start and end timestamps provided in the input. Do not modify timestamps
- Format the output as a list of JSON objects: [{"start": seconds, "end": seconds}, ...]
- The output must be readable by python json.loads function

Avoid including:
- Moments of greeting, thanking, or saying goodbye
- Non-question and answer interactions

If there are no valid 30-60 second clips to extract, return an empty list [].

The transcript is as follows:\n\n""" + str(transcript))
        print(f"Identified moments response: ${response.text}")
        return response.text

    @modal.fastapi_endpoint(method="POST")
    def process_video(self, request: ProcessVideoRequest, token: HTTPAuthorizationCredentials = Depends(auth_scheme)):
        """
        Main video processing endpoint that handles the complete clip generation pipeline.
        
        This endpoint:
        1. Authenticates the request
        2. Downloads video from S3
        3. Transcribes the audio
        4. Identifies optimal clip moments
        5. Processes each clip with ASD and subtitles
        6. Uploads final clips to S3
        
        Args:
            request: ProcessVideoRequest containing S3 key and max clips
            token: Bearer token for authentication
            
        Returns:
            Success response once all clips are processed and uploaded
        """
        s3_key = request.s3_key
        max_clips = request.max_clips

        # Verify authentication token
        if token.credentials != os.environ["AUTH_TOKEN"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail="Incorrect bearer token", headers={"WWW-Authenticate": "Bearer"})

        # Create unique working directory for this processing run
        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)

        # Set up video file path
        video_path = base_dir / "input.mp4"
        
        # Download video from S3 storage
        try:
            print(f"Downloading from S3: {s3_key}")
            s3_client = boto3.client("s3")
            s3_client.download_file("ai-podcast-clipper-dev", s3_key, str(video_path))
            print("Successfully downloaded from S3")
        except Exception as e:
            print(f"S3 download failed: {e}")
            # Try to use local test video as fallback
            test_video_path = "/test_video.mp4"
            if os.path.exists(test_video_path):
                print(f"Using test video fallback: {test_video_path}")
                shutil.copy(test_video_path, str(video_path))
            else:
                raise Exception("No video source available - S3 failed and no test video found")

        # 1. Transcription
        transcript_segments_json = self.transcribe_video(base_dir, video_path)
        transcript_segments = json.loads(transcript_segments_json)

        # 2. Identify moments for clips
        print("Identifying clip moments")
        identified_moments_raw = self.identify_moments(transcript_segments)

        cleaned_json_string = identified_moments_raw.strip()
        if cleaned_json_string.startswith("```json"):
            cleaned_json_string = cleaned_json_string[len("```json"):].strip()
        if cleaned_json_string.endswith("```"):
            cleaned_json_string = cleaned_json_string[:-len("```")].strip()

        clip_moments = json.loads(cleaned_json_string)
        if not clip_moments or not isinstance(clip_moments, list):
            print("Error: Identified moments is not a list")
            clip_moments = []

        clip_moments = clip_moments[:max_clips]
        print(f"Processing {len(clip_moments)} clips: {clip_moments}")

        # 3. Process all clips
        for index, moment in enumerate(clip_moments):
            if "start" in moment and "end" in moment:
                print("Processing clip" + str(index) + " from " +
                      str(moment["start"]) + " to " + str(moment["end"]))
                process_clip(base_dir, video_path, s3_key,
                             moment["start"], moment["end"], index, transcript_segments)

        if base_dir.exists():
            print(f"Cleaning up temp dir after {base_dir}")
            shutil.rmtree(base_dir, ignore_errors=True)


@app.local_entrypoint()
def main():
    import requests

    ai_podcast_clipper = AiPodcastClipper()

    url = ai_podcast_clipper.process_video.web_url

    payload = {
        "s3_key": "test1/mi65min.mp4.mp4"
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer 123123"
    }

    response = requests.post(url, json=payload,
                             headers=headers)
    response.raise_for_status()
    result = response.json()
    print(result)
