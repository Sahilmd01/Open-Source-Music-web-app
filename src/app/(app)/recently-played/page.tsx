"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { TrackList } from "@/components/features/track-list";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import type { Track } from "@/types/music";

export default function RecentlyPlayedPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("recently_played_tracks_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const unique: Track[] = [];

          for (const item of parsed) {
            if (!item) continue;
            const keyById = item.id ? `id:${item.id}` : null;
            const keyByName = item.title && item.artist
              ? `name:${item.title.trim().toLowerCase()}:${item.artist.trim().toLowerCase()}`
              : null;

            if ((keyById && seen.has(keyById)) || (keyByName && seen.has(keyByName))) {
              continue;
            }

            if (keyById) seen.add(keyById);
            if (keyByName) seen.add(keyByName);
            unique.push(item);
          }

          if (unique.length !== parsed.length) {
            localStorage.setItem("recently_played_tracks_v1", JSON.stringify(unique));
          }

          setTracks(unique);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleClearHistory = () => {
    if (!window.confirm("Are you sure you want to clear your recently played history? This action cannot be undone.")) {
      return;
    }
    try {
      localStorage.removeItem("recently_played_tracks_v1");
      setTracks([]);
      toast({
        kind: "success",
        title: "History Cleared",
        description: "Your recently played history has been cleared.",
      });
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast({
        kind: "error",
        title: "Clear Failed",
        description: "Could not clear your recently played history.",
      });
    }
  };

  if (!mounted) {
    return (
      <>
        <PageHeader title="Recently played" />
      </>
    );
  }

  return (
    <>
      <PageHeader 
        title="Recently played"
        action={
          tracks.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<CloseIcon width={14} height={14} />}
              onClick={handleClearHistory}
              title="Clear all recently played history"
            >
              Clear History
            </Button>
          )
        }
      />
      {tracks.length === 0 ? (
        <EmptyState
          title="No recently played songs"
          description="Songs you listen to will show up here."
        />
      ) : (
        <TrackList tracks={tracks} label="Recently played" />
      )}
    </>
  );
}
