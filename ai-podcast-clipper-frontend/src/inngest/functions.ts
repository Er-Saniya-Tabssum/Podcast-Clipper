/**
 * Inngest Background Functions for AI Podcast Clipper
 * =================================================
 *
 * This module handles background video processing workflows using Inngest.
 * It manages the complete pipeline from video upload to clip generation,
 * including credit validation, Modal GPU processing, and S3 storage.
 *
 * Author: Deepak Singhal
 */

import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const processVideo = inngest.createFunction(
  {
    id: "process-video",
    concurrency: {
      limit: 1, // Process one video per user at a time
      key: "event.data.userId", // Concurrency key based on user ID
    },
  },
  { event: "process-video-events" },
  async ({ event, step }) => {
    console.log("🎬 Starting video processing:", event.data);

    const { uploadedFileId, maxClips } = event.data as {
      uploadedFileId: string;
      userId: string;
      maxClips: number;
    };

    console.log("📁 Processing uploaded file ID:", uploadedFileId);
    console.log("💳 Max clips allowed:", maxClips);

    try {
      // Step 1: Validate user credits and get file information
      const { userId, credits, s3Key } = await step.run(
        "check-credits",
        async () => {
          const uploadedFile = await db.uploadedFile.findUniqueOrThrow({
            where: {
              id: uploadedFileId,
            },
            select: {
              user: {
                select: {
                  id: true,
                  credits: true,
                },
              },
              s3Key: true,
            },
          });

          // Double-check credits haven't changed
          if (uploadedFile.user.credits < 1) {
            throw new Error("Insufficient credits");
          }

          return {
            userId: uploadedFile.user.id,
            credits: uploadedFile.user.credits,
            s3Key: uploadedFile.s3Key,
          };
        },
      );

      if (credits > 0) {
        await step.run("set-status-processing", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processing",
            },
          });
        });

        const processResult = await step.fetch(env.PROCESS_VIDEO_ENDPOINT, {
          method: "POST",
          body: JSON.stringify({
            s3_key: s3Key,
            max_clips: Math.min(maxClips, credits), // Limit clips to available credits
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.PROCESS_VIDEO_ENDPOINT_AUTH}`,
          },
        });

        if (!processResult.ok) {
          throw new Error(
            `Backend processing failed: ${processResult.status} ${processResult.statusText}`,
          );
        }

        const { clipsFound } = await step.run(
          "create-clips-in-db",
          async () => {
            const folderPrefix = s3Key.split("/")[0]!;

            const allKeys = await listS3ObjectsByPrefix(folderPrefix);

            const clipKeys = allKeys.filter(
              (key): key is string =>
                key !== undefined && !key.endsWith("original.mp4"),
            );

            // Limit clips to what user can afford
            const affordableClips = clipKeys.slice(
              0,
              Math.min(maxClips, credits),
            );

            if (affordableClips.length > 0) {
              await db.clip.createMany({
                data: affordableClips.map((clipKey) => ({
                  s3Key: clipKey,
                  uploadedFileId,
                  userId,
                })),
              });
            }

            console.log(
              `💰 Created ${affordableClips.length} clips (limited by ${Math.min(maxClips, credits)} credits)`,
            );
            return { clipsFound: affordableClips.length };
          },
        );

        // Deduct credits based on actual clips created
        await step.run("deduct-credits", async () => {
          const creditsToDeduct = Math.min(credits, clipsFound);
          await db.user.update({
            where: {
              id: userId,
            },
            data: {
              credits: {
                decrement: creditsToDeduct,
              },
            },
          });
          console.log(`💳 Deducted ${creditsToDeduct} credits`);
        });

        await step.run("set-status-processed", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "processed",
            },
          });
        });
      } else {
        await step.run("set-status-no-credits", async () => {
          await db.uploadedFile.update({
            where: {
              id: uploadedFileId,
            },
            data: {
              status: "no credits",
            },
          });
        });
      }
    } catch (error: unknown) {
      console.error("Processing failed:", error);

      // Set status to failed
      await db.uploadedFile.update({
        where: {
          id: uploadedFileId,
        },
        data: {
          status: "failed",
        },
      });

      // Note: Credits are only deducted after successful processing,
      // so no refund needed here
      throw error;
    }
  },
);

async function listS3ObjectsByPrefix(prefix: string) {
  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const listCommand = new ListObjectsV2Command({
    Bucket: env.S3_BUCKET_NAME,
    Prefix: prefix,
  });

  const response = await s3Client.send(listCommand);
  return response.Contents?.map((item) => item.Key).filter(Boolean) ?? [];
}
