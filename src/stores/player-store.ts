import { create } from "zustand";
import type { Track } from "@/types/music";
import { useUiStore } from "./ui-store";

const checkAuthOrPrompt = (): boolean => {
  const ui = useUiStore.getState();
  if (!ui.isAuthenticated) {
    ui.openLoginModal();
    return false;
  }
  return true;
};

export interface SelectedContext {
  type: "playlist" | "album" | "artist";
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  hue?: number;
  tracks: Track[];
}

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  /** Whether the audio is currently loading or buffering */
  isBuffering: boolean;
  /** Whether the user has actively selected or started playing a song/context */
  hasStarted: boolean;
  /** Seconds elapsed in the current track */
  progress: number;
  volume: number;
  prevVolume: number;
  shuffle: boolean;
  repeat: boolean;
  likedIds: string[];
  selectedContext: SelectedContext | null;

  setIsBuffering: (buffering: boolean) => void;
  setSelectedContext: (context: SelectedContext | null) => void;
  playContextTrack: (track: Track, contextTracks?: Track[]) => void;
  toggle: () => void;
  playTrack: (id: string, customTrack?: Track) => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  tick: () => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: (id: string) => void;
}

const getInitialLikedIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("user_liked_track_ids_v1");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
};

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  isBuffering: false,
  hasStarted: false,
  progress: 0,
  volume: 0.7,
  prevVolume: 0.7,
  shuffle: false,
  repeat: false,
  likedIds: getInitialLikedIds(),
  selectedContext: null,

  setIsBuffering: (buffering) => set({ isBuffering: buffering }),
  setSelectedContext: (context) => set({ selectedContext: context }),

  playContextTrack: (track, contextTracks) => {
    if (!checkAuthOrPrompt()) return;
    let queue = contextTracks && contextTracks.length > 0 ? contextTracks : get().queue;
    let index = queue.findIndex((t) => t.id === track.id);
    if (index === -1) {
      queue = [track, ...queue];
      index = 0;
    }
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("recently_played_tracks_v1");
        const list: Track[] = stored ? JSON.parse(stored) : [];
        const isMatch = (t: Track) =>
          (track.id && t.id && String(t.id) === String(track.id)) ||
          (t.title && track.title && t.title.trim().toLowerCase() === track.title.trim().toLowerCase() &&
           t.artist && track.artist && t.artist.trim().toLowerCase() === track.artist.trim().toLowerCase());
        const updated = [track, ...list.filter((t) => !isMatch(t))].slice(0, 50);
        localStorage.setItem("recently_played_tracks_v1", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    set({ queue, currentIndex: index, progress: 0, isPlaying: true, hasStarted: true });
  },

  toggle: () => {
    if (!get().isPlaying && !checkAuthOrPrompt()) return;
    set((s) => ({ isPlaying: !s.isPlaying, hasStarted: true }));
  },

  playTrack: (id, customTrack) => {
    if (!checkAuthOrPrompt()) return;
    let queue = get().queue;
    let index = queue.findIndex((t) => t.id === id);
    const targetTrack = customTrack || queue[index];
    if (targetTrack && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("recently_played_tracks_v1");
        const list: Track[] = stored ? JSON.parse(stored) : [];
        const isMatch = (t: Track) =>
          (targetTrack.id && t.id && String(t.id) === String(targetTrack.id)) ||
          (t.title && targetTrack.title && t.title.trim().toLowerCase() === targetTrack.title.trim().toLowerCase() &&
           t.artist && targetTrack.artist && t.artist.trim().toLowerCase() === targetTrack.artist.trim().toLowerCase());
        const updated = [targetTrack, ...list.filter((t) => !isMatch(t))].slice(0, 50);
        localStorage.setItem("recently_played_tracks_v1", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    if (index === -1 && customTrack) {
      queue = [customTrack, ...queue];
      index = 0;
      set({ queue, currentIndex: index, progress: 0, isPlaying: true, hasStarted: true });
      return;
    }
    if (index >= 0) set({ currentIndex: index, progress: 0, isPlaying: true, hasStarted: true });
  },

  next: () => {
    const { queue, currentIndex, shuffle, repeat, selectedContext } = get();
    if (queue.length === 0) return;

    // Single song, no repeat → stop playback and reset
    if (queue.length === 1 && !repeat) {
      set({ progress: 0, isPlaying: false });
      return;
    }

    // Calculate next index
    const nextIndex = shuffle
      ? (currentIndex + 1 + Math.floor(Math.random() * Math.max(queue.length - 1, 1))) % queue.length
      : (currentIndex + 1) % queue.length;

    // If we're at the last song and have a context (playlist/album), cycle back to first
    // This ensures seamless looping within playlists/albums
    if (selectedContext && (selectedContext.type === "playlist" || selectedContext.type === "album")) {
      if (currentIndex === queue.length - 1) {
        // Last song - cycle to beginning
        set({ currentIndex: 0, progress: 0, isPlaying: true, hasStarted: true });
        return;
      }
    }

    set({ currentIndex: nextIndex, progress: 0, isPlaying: true, hasStarted: true });
  },

  previous: () => {
    const { queue, currentIndex, progress } = get();
    if (progress > 3) return set({ progress: 0 });
    set({ currentIndex: (currentIndex - 1 + queue.length) % queue.length, progress: 0, hasStarted: true });
  },

  seek: (seconds) => set({ progress: Math.max(0, seconds) }),

  tick: () => {
    const { queue, currentIndex, progress, next, repeat } = get();
    const track = queue[currentIndex];
    if (!track) return;
    if (progress + 1 >= track.duration) {
      if (repeat) {
        set({ progress: 0 });
      } else {
        next();
      }
    } else {
      set({ progress: progress + 1 });
    }
  },

  setVolume: (value) => {
    const clamped = Math.min(1, Math.max(0, value));
    set((s) => ({
      volume: clamped,
      prevVolume: clamped > 0 ? clamped : s.prevVolume,
    }));
  },
  toggleMute: () =>
    set((s) => {
      if (s.volume > 0) {
        return { volume: 0, prevVolume: s.volume };
      } else {
        return { volume: s.prevVolume > 0 ? s.prevVolume : 0.7 };
      }
    }),
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  toggleRepeat: () => set((s) => ({ repeat: !s.repeat })),
  toggleLike: (id) =>
    set((s) => {
      const nextLiked = s.likedIds.includes(id)
        ? s.likedIds.filter((x) => x !== id)
        : [...s.likedIds, id];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("user_liked_track_ids_v1", JSON.stringify(nextLiked));
        } catch {
          // ignore
        }
      }
      return { likedIds: nextLiked };
    }),
}));

/** Selector helper: the track currently loaded in the player. */
export const selectCurrentTrack = (s: PlayerState): Track | undefined =>
  s.hasStarted ? s.queue[s.currentIndex] : undefined;
