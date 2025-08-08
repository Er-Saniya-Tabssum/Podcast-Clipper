/**
 * Dashboard Client Component
 * =========================
 *
 * Main dashboard interface for AI Podcast Clipper SaaS.
 * Handles file uploads, video processing, and clip management.
 *
 * Features:
 * - Drag & drop video upload with validation
 * - Real-time credit checking and validation
 * - File processing status tracking
 * - Clip gallery with download/preview
 * - Responsive design with tabs interface
 *
 * Author: Deepak Singhal
 */

"use client";

import Dropzone, { type DropzoneState } from "shadcn-dropzone";
import type { Clip } from "@prisma/client";
import Link from "next/link";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { generateUploadUrl } from "~/actions/s3";
import { toast } from "sonner";
import { processVideo } from "~/actions/generation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { ClipDisplay } from "./clip-display";

export function DashboardClient({
  uploadedFiles,
  clips,
  userCredits,
}: {
  uploadedFiles: {
    id: string;
    s3Key: string;
    filename: string;
    status: string;
    clipsCount: number;
    createdAt: Date;
  }[];
  clips: Clip[];
  userCredits: number;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    // Check if user has sufficient credits
    if (userCredits < 1) {
      toast.error("Insufficient credits", {
        description:
          "You need at least 1 credit to upload a video. Please purchase more credits.",
        duration: 5000,
        action: {
          label: "Buy Credits",
          onClick: () => router.push("/dashboard/billing"),
        },
      });
      return;
    }

    const file = files[0]!;
    setUploading(true);

    try {
      const { success, signedUrl, uploadedFileId } = await generateUploadUrl({
        filename: file.name,
        contentType: file.type,
      });

      if (!success) throw new Error("Failed to get upload URL");

      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok)
        throw new Error(`Upload filed with status: ${uploadResponse.status}`);

      await processVideo(uploadedFileId);

      setFiles([]);

      toast.success("Video uploaded successfully", {
        description:
          "Your video has been scheduled for processing. Check the status below.",
        duration: 5000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "There was a problem uploading your video. Please try again.";

      if (errorMessage.includes("Insufficient credits")) {
        toast.error("Insufficient credits", {
          description:
            "You need at least 1 credit to upload a video. Please purchase more credits.",
          duration: 5000,
          action: {
            label: "Buy Credits",
            onClick: () => router.push("/dashboard/billing"),
          },
        });
      } else {
        toast.error("Upload failed", {
          description: errorMessage,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-10 px-4 py-8">
      {/* Header */}
      <div className="animate-slide-down flex items-center justify-between">
        <div className="space-y-3">
          <h1 className="text-gradient text-4xl font-bold tracking-tight lg:text-5xl">
            AI Podcast Clipper
          </h1>
          <p className="text-muted-foreground text-lg lg:text-xl">
            🌿 Upload your podcast and get AI-generated clips instantly with
            peaceful precision
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="animate-fade-scale">
        <Tabs defaultValue="upload" className="space-y-8">
          <TabsList className="bg-card/60 border-border/50 grid w-full max-w-md grid-cols-2 border backdrop-blur-md">
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-gradient-primary transition-all duration-300 data-[state=active]:text-white"
            >
              📤 Upload
            </TabsTrigger>
            <TabsTrigger
              value="my-clips"
              className="data-[state=active]:bg-gradient-primary transition-all duration-300 data-[state=active]:text-white"
            >
              🎬 My Clips
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-8">
            <Card className="glass-effect hover:border-primary/20 hover-lift border-2 border-transparent transition-all duration-300">
              <CardHeader className="pb-8 text-center">
                <CardTitle className="text-gradient text-3xl font-bold">
                  Upload Your Podcast
                </CardTitle>
                <CardDescription className="text-lg">
                  🎯 Drop your audio or video file and let AI work its magic
                  with professional precision
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dropzone */}
                <div className="relative">
                  <Dropzone
                    onDrop={handleDrop}
                    accept={{ "video/mp4": [".mp4"] }}
                    maxSize={500 * 1024 * 1024}
                    disabled={uploading || userCredits < 1}
                    maxFiles={1}
                  >
                    {(_dropzone: DropzoneState) => (
                      <div
                        className={`border-primary/20 from-primary/3 to-accent/3 hover:border-primary/30 relative rounded-xl border-2 border-dashed bg-gradient-to-br via-transparent p-12 text-center transition-all duration-300 ${userCredits < 1 ? "cursor-not-allowed opacity-50" : "hover:bg-primary/5"}`}
                      >
                        {userCredits < 1 ? (
                          <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="rounded-full bg-gray-400 p-4 text-white">
                              <UploadCloud className="h-12 w-12" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-foreground text-xl font-semibold">
                                💳 No Credits Available
                              </p>
                              <p className="text-muted-foreground">
                                Purchase credits to upload and process videos
                              </p>
                            </div>
                            <Link href="/dashboard/billing">
                              <Button
                                className="bg-gradient-primary hover-lift font-semibold text-white shadow-md hover:opacity-95"
                                variant="default"
                                size="lg"
                              >
                                💰 Buy Credits
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="bg-gradient-primary animate-peaceful-float rounded-full p-4 text-white">
                              <UploadCloud className="h-12 w-12" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-foreground text-xl font-semibold">
                                Drag & drop your podcast file
                              </p>
                              <p className="text-muted-foreground">
                                or click to browse (MP4 up to 500MB)
                              </p>
                            </div>
                            <Button
                              className="bg-gradient-primary hover-lift font-semibold text-white shadow-md hover:opacity-95"
                              variant="default"
                              size="lg"
                              disabled={uploading}
                            >
                              📁 Select File
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Dropzone>
                </div>

                {/* Selected Files & Upload Button - Only show if user has credits */}
                {userCredits > 0 && (
                  <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
                    <div className="flex-1">
                      {files.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-foreground font-semibold">
                            Selected file:
                          </p>
                          {files.map((file) => (
                            <div
                              key={file.name}
                              className="flex items-center gap-2"
                            >
                              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                              <p className="text-muted-foreground">
                                {file.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          No file selected
                        </p>
                      )}
                    </div>
                    <Button
                      disabled={
                        files.length === 0 || uploading || userCredits < 1
                      }
                      onClick={handleUpload}
                      className="bg-gradient-primary hover-lift font-semibold text-white shadow-md hover:opacity-95"
                      size="lg"
                      title={
                        userCredits < 1
                          ? "You need at least 1 credit to upload"
                          : ""
                      }
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing Magic... ✨
                        </>
                      ) : userCredits < 1 ? (
                        <>💳 Need Credits to Upload</>
                      ) : (
                        <>🚀 Upload & Generate Clips</>
                      )}
                    </Button>
                  </div>
                )}

                {/* Upload Queue Status */}
                {uploadedFiles.length > 0 && (
                  <Card className="glass-effect border-border/50 border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground text-lg font-semibold">
                          📊 Queue Status
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRefresh}
                          disabled={refreshing}
                          className="hover-lift border-primary/20 text-primary hover:bg-primary/10"
                        >
                          {refreshing && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          🔄 Refresh
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="border-border/30 max-h-[400px] overflow-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="font-semibold">
                                📁 File
                              </TableHead>
                              <TableHead className="font-semibold">
                                📅 Uploaded
                              </TableHead>
                              <TableHead className="font-semibold">
                                ⚡ Status
                              </TableHead>
                              <TableHead className="font-semibold">
                                🎬 Clips
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {uploadedFiles.map((item) => (
                              <TableRow
                                key={item.id}
                                className="hover:bg-muted/30 transition-colors"
                              >
                                <TableCell className="max-w-xs truncate font-medium">
                                  {item.filename}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {new Date(
                                    item.createdAt,
                                  ).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {item.status === "queued" && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-yellow-100 text-yellow-800"
                                    >
                                      ⏳ Queued
                                    </Badge>
                                  )}
                                  {item.status === "processing" && (
                                    <Badge
                                      variant="secondary"
                                      className="animate-pulse bg-blue-100 text-blue-800"
                                    >
                                      ⚙️ Processing
                                    </Badge>
                                  )}
                                  {item.status === "processed" && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-100 text-green-800"
                                    >
                                      ✅ Processed
                                    </Badge>
                                  )}
                                  {item.status === "no credits" && (
                                    <Badge variant="destructive">
                                      💳 No Credits
                                    </Badge>
                                  )}
                                  {item.status === "failed" && (
                                    <Badge variant="destructive">
                                      ❌ Failed
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {item.clipsCount > 0 ? (
                                    <div className="flex items-center gap-1">
                                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                      <span className="font-medium">
                                        {item.clipsCount} clip
                                        {item.clipsCount !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      No clips yet
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Clips Tab */}
          <TabsContent value="my-clips" className="animate-fade-scale">
            <Card className="glass-effect hover:border-primary/20 hover-lift border-2 border-transparent transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-gradient text-2xl font-bold">
                  🎬 My Generated Clips
                </CardTitle>
                <CardDescription className="text-lg">
                  {clips.length} clip{clips.length !== 1 ? "s" : ""} ready for
                  download. Processing may take a few minutes ⏰
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="from-primary/5 to-accent/5 rounded-lg bg-gradient-to-br via-transparent p-6">
                  <ClipDisplay clips={clips} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="animate-fade-scale border-border/30 mt-16 border-t pt-8">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Made with ❤️ by{" "}
            <a
              href="https://github.com/devopsdeepaks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
            >
              Deepak Singhal
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
