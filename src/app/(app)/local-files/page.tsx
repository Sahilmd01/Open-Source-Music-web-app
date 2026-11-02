"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SongsTable } from "@/components/songs";
import { UploadCloudIcon, MusicNoteIcon } from "@/components/icons";
import { usePlayerStore } from "@/stores/player-store";
import type { Track } from "@/types/music";

const LOCAL_FILES_KEY = "my_local_files_tracks_v1";

export default function LocalFilesPage() {
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true); // Default auto-selected
  const fileInputRef = useRef<HTMLInputElement>(null);

  const playTrack = usePlayerStore((s) => s.playTrack);
  const playContextTrack = usePlayerStore((s) => s.playContextTrack);
  const togglePlay = usePlayerStore((s) => s.toggle);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const currentTrackId = queue[currentIndex]?.id;
  const likedIds = usePlayerStore((s) => s.likedIds);
  const toggleLike = usePlayerStore((s) => s.toggleLike);

  // Load saved local files from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_FILES_KEY);
      if (stored) {
        setLocalTracks(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAudioFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!agreeTerms) {
      alert("Please agree to the Terms of Service & Copyright Policy before uploading music.");
      return;
    }

    const validFiles: File[] = [];
    Array.from(files).forEach((f) => {
      if (f) {
        const isMusic = f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|aac|ogg|wma)$/i.test(f.name);
        if (isMusic) {
          validFiles.push(f);
        }
      }
    });

    if (validFiles.length === 0) {
      alert("Please select valid music files (.mp3, .wav, .flac). Other file types are not allowed.");
      return;
    }

    // Process each music file
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const audio = new Audio();
        audio.src = dataUrl;
        audio.onloadedmetadata = () => {
          const duration = Math.round(audio.duration) || 180;
          const cleanTitle = file.name.replace(/\.[^/.]+$/, "").slice(0, 45);

          const newTrack: Track = {
            id: `local-trk-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            title: cleanTitle,
            artist: "Local Audio File",
            album: "Local Files",
            duration,
            hue: Math.floor(Math.random() * 360),
            uploadedBy: "Local Computer",
            audioSrc: dataUrl,
            isCustom: true,
          };

          setLocalTracks((prev) => {
            const next = [newTrack, ...prev];
            try {
              localStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleAudioFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleAudioFiles(e.dataTransfer.files);
  };

  const isLocalPlaying = isPlaying && localTracks.some((t) => t.id === currentTrackId);

  const handlePlayAll = () => {
    if (isLocalPlaying) {
      togglePlay();
    } else {
      const first = localTracks[0];
      if (first) {
        playContextTrack(first, localTracks);
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-4)" }}>
        <div>
          <PageHeader title="Local files" />
          <p className="text-muted text-small" style={{ margin: "4px 0 0" }}>
            Add audio tracks from your computer (MP3, WAV, FLAC only) to play inside your library.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".mp3,audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/aac,audio/ogg,audio/m4a,audio/*"
            style={{ display: "none" }}
            onChange={onFileInputChange}
          />
          <Button
            variant="accent"
            leadingIcon={<UploadCloudIcon width={18} height={18} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Music File (.mp3)
          </Button>

          {localTracks.length > 0 && (
            <Button
              variant="secondary"
              onClick={handlePlayAll}
            >
              {isLocalPlaying ? "Pause" : "Play All"}
            </Button>
          )}
        </div>
      </div>

      {/* Drag & Drop Upload Zone - Strict Music File Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragging ? "2px dashed var(--accent)" : "1px dashed var(--border-default)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-8) var(--space-4)",
          textAlign: "center",
          cursor: "pointer",
          background: isDragging ? "var(--accent-soft)" : "var(--bg-surface-2)",
          transition: "all 0.15s ease",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-3)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--bg-surface-3)",
            display: "grid",
            placeItems: "center",
            color: "var(--brand)",
          }}
        >
          <MusicNoteIcon width={26} height={26} />
        </div>
        <div>
          <h3 style={{ fontSize: "var(--fs-md)", fontWeight: "var(--fw-semibold)", margin: 0 }}>
            Upload or Drag Music Files Here
          </h3>
          <p className="text-muted text-small" style={{ margin: "4px 0 0" }}>
            Strictly audio formats supported: <strong>.mp3, .wav, .flac, .m4a</strong> (non-audio files will be rejected)
          </p>
        </div>
      </div>

      {/* Terms & Service / Copyright Declaration Checkbox (Auto-selected by default) */}
      <div
        style={{
          padding: "12px 16px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          maxWidth: "600px",
        }}
      >
        <input
          id="local-agree-terms"
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          style={{
            accentColor: "var(--brand)",
            width: "16px",
            height: "16px",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <label
          htmlFor="local-agree-terms"
          style={{
            fontSize: "12.5px",
            color: "var(--text-secondary)",
            lineHeight: "1.45",
            cursor: "pointer",
          }}
        >
          I agree to the{" "}
          <Link
            href="/terms"
            target="_blank"
            style={{
              color: "var(--brand)",
              fontWeight: "var(--fw-semibold)",
              textDecoration: "underline",
              fontSize: "12.5px",
            }}
          >
            Terms of Service
          </Link>{" "}
          &amp; Copyright Policy, and confirm I have the rights to upload and share this content.
        </label>
      </div>

      {/* Song Table UI (Identical 9-column UI with Uploaded By, Duration, Playlist Add & Like) */}
      {localTracks.length > 0 && (
        <section aria-labelledby="local-tracks-heading">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
            <h2 id="local-tracks-heading" style={{ fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)", margin: 0 }}>
              Uploaded Local Songs ({localTracks.length})
            </h2>
          </div>

          <SongsTable
            tracks={localTracks}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            likedIds={likedIds}
            onPlayTrack={(t) => playContextTrack(t, localTracks)}
            onToggleLike={toggleLike}
            label="Local files playlist"
          />
        </section>
      )}
    </div>
  );
}
