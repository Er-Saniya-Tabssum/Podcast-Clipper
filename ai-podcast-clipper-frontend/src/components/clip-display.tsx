"use client";

import type { Clip } from "@prisma/client";
import { Download, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { getClipPlayUrl } from "~/actions/generation";
import { Button } from "./ui/button";

function ClipCard({ clip }: { clip: Clip }) {
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(true);

  useEffect(() => {
    async function fetchPlayUrl() {
      try {
        const result = await getClipPlayUrl(clip.id);
        if (result.succes && result.url) {
          setPlayUrl(result.url);
        } else if (result.error) {
          console.error("Failed to get play url: " + result.error);
        }
      } catch {
      } finally {
        setIsLoadingUrl(false);
      }
    }

    void fetchPlayUrl();
  }, [clip.id]);

  const handleDownload = () => {
    if (playUrl) {
      const link = document.createElement("a");
      link.href = playUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="group glass-card border-border/20 hover:border-primary/20 hover-lift relative flex flex-col gap-5 rounded-2xl border transition-all duration-300">
      <div className="from-primary/5 to-accent/5 relative aspect-[9/16] overflow-hidden rounded-xl bg-gradient-to-br p-3">
        {isLoadingUrl ? (
          <div className="bg-card/30 flex h-full w-full items-center justify-center rounded-lg">
            <div className="space-y-4 text-center">
              <Loader2 className="text-primary mx-auto h-10 w-10 animate-spin" />
              <p className="text-muted-foreground text-sm font-medium">
                Loading clip...
              </p>
            </div>
          </div>
        ) : playUrl ? (
          <div className="relative h-full w-full">
            <video
              src={playUrl}
              controls
              preload="metadata"
              className="h-full w-full rounded-lg object-cover shadow-md"
              style={{ outline: "none" }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="bg-card/30 flex h-full w-full items-center justify-center rounded-lg">
            <div className="space-y-4 text-center">
              <Play className="text-muted-foreground mx-auto h-14 w-14 opacity-60" />
              <p className="text-muted-foreground text-sm font-medium">
                Clip unavailable
              </p>
            </div>
          </div>
        )}

        {/* Subtle overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-xs font-medium">
            Created: {new Date(clip.createdAt).toLocaleDateString()}
          </div>
          <div className="text-primary bg-primary/10 rounded-lg px-3 py-1 text-xs font-semibold">
            #{clip.id.slice(-6)}
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={!playUrl}
          className="bg-gradient-primary hover-lift w-full font-semibold text-white shadow-sm transition-all duration-300 hover:opacity-95 disabled:opacity-50"
          size="default"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Clip
        </Button>
      </div>
    </div>
  );
}

export function ClipDisplay({ clips }: { clips: Clip[] }) {
  if (clips.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <div className="from-primary/20 to-accent/20 mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br">
          <Play className="text-muted-foreground h-10 w-10 opacity-50" />
        </div>
        <div className="space-y-2">
          <h3 className="text-foreground text-lg font-semibold">
            No clips yet
          </h3>
          <p className="text-muted-foreground mx-auto max-w-md">
            Upload a podcast file to generate your first AI-powered clips! 🎬
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ClipCard clip={clip} />
          </div>
        ))}
      </div>
    </div>
  );
}
