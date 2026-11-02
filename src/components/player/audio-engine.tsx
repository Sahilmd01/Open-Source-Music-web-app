"use client";

/**
 * AudioEngine — invisible component that drives real HTML audio playback.
 * Mount once inside AppShell alongside <PlayerBar />.
 * It syncs the Zustand player store ↔ HTMLAudioElement in both directions.
 * Includes retry logic for 503 (Telegram temporarily unavailable) responses.
 */

import { useEffect, useRef, useCallback } from "react";
import { selectCurrentTrack, usePlayerStore } from "@/stores/player-store";

const MAX_RETRIES = 5;
const RETRY_DELAYS = [2000, 4000, 8000, 12000, 20000]; // ms

export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  const track      = usePlayerStore(selectCurrentTrack);
  const isPlaying  = usePlayerStore((s) => s.isPlaying);
  const volume     = usePlayerStore((s) => s.volume);
  const progress   = usePlayerStore((s) => s.progress);
  const seek       = usePlayerStore((s) => s.seek);
  const next       = usePlayerStore((s) => s.next);
  const repeat     = usePlayerStore((s) => s.repeat);

  const setIsBuffering = usePlayerStore((s) => s.setIsBuffering);
  const queue          = usePlayerStore((s) => s.queue);
  const currentIndex   = usePlayerStore((s) => s.currentIndex);

  const audioUrl = track?.audioUrl ?? track?.audioSrc ?? null;

  // Preload next track in queue for near-instant transitions
  useEffect(() => {
    if (!queue || queue.length <= 1) return;
    const nextIdx = (currentIndex + 1) % queue.length;
    const nextTrack = queue[nextIdx];
    const nextUrl = nextTrack?.audioUrl ?? nextTrack?.audioSrc;
    if (nextUrl && typeof window !== "undefined") {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "fetch";
      link.href = nextUrl;
      document.head.appendChild(link);
      return () => {
        try {
          document.head.removeChild(link);
        } catch {}
      };
    }
  }, [queue, currentIndex]);

  const clearRetry = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    retryCountRef.current = 0;
  }, []);

  // Retry loading the audio src after a delay
  const scheduleRetry = useCallback((audio: HTMLAudioElement, src: string) => {
    const attempt = retryCountRef.current;
    if (attempt >= MAX_RETRIES) {
      console.warn(`AudioEngine: giving up after ${MAX_RETRIES} retries for`, src);
      setIsBuffering(false);
      return;
    }
    const delay = RETRY_DELAYS[attempt] ?? 20000;
    console.warn(`AudioEngine: 503 — retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    retryCountRef.current += 1;
    retryTimerRef.current = setTimeout(() => {
      // Re-assign src to force browser to retry the fetch
      audio.src = "";
      audio.src = src;
      audio.load();
      audio.play().catch(() => {});
    }, delay);
  }, [setIsBuffering]);

  // Create the hidden <audio> element once on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      clearRetry();
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [clearRetry]);

  // ── Track change: load new src and auto-play ──────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    clearRetry();

    if (!audioUrl) {
      audio.pause();
      audio.src = "";
      setIsBuffering(false);
      return;
    }

    if (audio.src !== audioUrl && audio.currentSrc !== audioUrl) {
      if (isPlaying) {
        setIsBuffering(true);
      }
      audio.src = audioUrl;
      audio.load();
      seek(0);
    }

    if (isPlaying) {
      setIsBuffering(true);
      audio.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("AudioEngine: play() failed:", err.message);
          setIsBuffering(false);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // ── Play / Pause ──────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (isPlaying) {
      audio.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("AudioEngine: play() failed:", err.message);
        }
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl]);

  // ── Volume ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(1, Math.max(0, volume));
  }, [volume]);

  // ── Seek from store (user dragged scrubber) ───────────────────────────────
  const lastTimeUpdateRef = useRef<number>(0);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (Math.abs(audio.currentTime - progress) > 1.5) {
      audio.currentTime = progress;
    }
  }, [progress, audioUrl]);

  // ── timeupdate / ended / error listeners ──────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (Math.abs(audio.currentTime - lastTimeUpdateRef.current) >= 0.5) {
        lastTimeUpdateRef.current = audio.currentTime;
        seek(audio.currentTime);
      }
    };

    const handleEnded = () => {
      clearRetry();
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        // Get current state to check context
        const { queue, selectedContext, currentIndex } = usePlayerStore.getState();
        
        // If playing a playlist or album, and we're at the last song, cycle to first
        if (selectedContext && (selectedContext.type === "playlist" || selectedContext.type === "album")) {
          if (currentIndex === queue.length - 1) {
            // At end of playlist/album - cycle to first song
            next();
            return;
          }
        }
        
        // Otherwise: move to next song normally
        next();
        
        // If single song — pause the audio element immediately
        const { queue: updatedQueue } = usePlayerStore.getState();
        if (updatedQueue.length <= 1) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    };

    const handleError = () => {
      const err = audio.error;
      if (!err) return;

      // MEDIA_ERR_SRC_NOT_SUPPORTED (4) can mean 503/404 — check via HEAD
      if (err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED || err.code === MediaError.MEDIA_ERR_NETWORK) {
        const src = audio.src;
        if (!src || !src.includes('/api/')) return;

        // HEAD-check to distinguish a real 404 from a transient 503
        fetch(src, { method: 'HEAD' })
          .then((res) => {
            if (res.status === 503) {
              scheduleRetry(audio, src);
            } else if (res.status === 404) {
              console.warn("AudioEngine: file not found (404), not retrying:", src);
            } else {
              console.warn("AudioEngine: unexpected status", res.status, "for", src);
            }
          })
          .catch(() => {
            // Network error — retry anyway
            scheduleRetry(audio, src);
          });
      } else {
        console.warn("AudioEngine: media error:", err.code, err.message);
      }
      setIsBuffering(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const handleCanPlay = () => {
      setIsBuffering(false);
    };

    const handlePause = () => {
      setIsBuffering(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [seek, next, repeat, clearRetry, scheduleRetry, setIsBuffering]);

  return null;
}
