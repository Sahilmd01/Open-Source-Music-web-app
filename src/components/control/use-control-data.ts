"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/providers/toast-provider";
import { uploadMediaToStorage } from "@/lib/storage-upload";
import { INITIAL_REPORTS } from "./initial-reports";
import type { SongItem, ArtistItem, PlaylistItem, AlbumItem, ReportItem } from "./control-types";
import type { Playlist, Album, Track } from "@/types/music";

interface UseControlDataProps {
  isAdmin: boolean;
  openLoginModal: () => void;
}

export function useControlData({ isAdmin, openLoginModal }: UseControlDataProps) {
  const { toast } = useToast();

  // Songs
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);

  // Artists
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);

  // Playlists
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  // Albums
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);

  // Reports
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);

  // Fetch callbacks
  const fetchSongs = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingSongs(true);
    try {
      const res = await fetch("/api/control/songs");
      const data = await res.json();
      if (data.success && Array.isArray(data.songs)) {
        setSongs(data.songs);
      }
    } catch (err) {
      console.error("Failed to fetch songs:", err);
    } finally {
      setIsLoadingSongs(false);
    }
  }, [isAdmin]);

  const fetchArtists = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingArtists(true);
    try {
      const res = await fetch("/api/control/artists");
      const data = await res.json();
      if (data.success && Array.isArray(data.artists)) {
        setArtists(data.artists);
      }
    } catch (err) {
      console.error("Failed to fetch artists:", err);
    } finally {
      setIsLoadingArtists(false);
    }
  }, [isAdmin]);

  const fetchPlaylists = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingPlaylists(true);
    try {
      const res = await fetch("/api/control/playlists");
      const data = await res.json();
      if (data.success && Array.isArray(data.playlists)) {
        setPlaylists(data.playlists);
      }
    } catch (err) {
      console.error("Failed to fetch playlists:", err);
    } finally {
      setIsLoadingPlaylists(false);
    }
  }, [isAdmin]);

  const fetchAlbums = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingAlbums(true);
    try {
      const res = await fetch("/api/control/albums");
      const data = await res.json();
      if (data.success && Array.isArray(data.albums)) {
        setAlbums(data.albums);
      }
    } catch (err) {
      console.error("Failed to fetch albums:", err);
    } finally {
      setIsLoadingAlbums(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchSongs();
      fetchArtists();
      fetchPlaylists();
      fetchAlbums();
    }
  }, [isAdmin, fetchSongs, fetchArtists, fetchPlaylists, fetchAlbums]);

  // Actions
  const handleToggleSong = async (id: string) => {
    const target = songs.find((s) => s.id === id);
    if (!target) return;
    const next = target.status === "active" ? "inactive" : "active";

    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: next } : s))
    );

    try {
      const res = await fetch("/api/control/songs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update status in database");
      }

      toast({
        kind: next === "active" ? "success" : "info",
        title: `Track ${next === "active" ? "Activated" : "Deactivated"}`,
        description: `"${target.title}" is now ${next} for listeners.`,
      });
    } catch (err: any) {
      setSongs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: target.status } : s))
      );
      toast({
        kind: "error",
        title: "Update Failed",
        description: err.message || "Could not update track status in database.",
      });
    }
  };

  const handleToggleArtist = async (id: string) => {
    const target = artists.find((a) => a.id === id);
    if (!target) return;
    const next = target.status === "active" ? "inactive" : "active";

    setArtists((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: next } : a))
    );

    try {
      const res = await fetch("/api/control/artists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update artist status");

      toast({
        kind: next === "active" ? "success" : "info",
        title: `Artist ${next === "active" ? "Enabled" : "Disabled"}`,
        description: `${target.name} is now ${next}.`,
      });
    } catch (err: any) {
      setArtists((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: target.status } : a))
      );
      toast({
        kind: "error",
        title: "Update Failed",
        description: err.message || "Could not update artist status.",
      });
    }
  };

  const handleTogglePlaylist = async (id: string) => {
    const target = playlists.find((p) => p.id === id);
    if (!target) return;
    const next = target.status === "active" ? "inactive" : "active";

    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: next } : p))
    );

    try {
      const res = await fetch("/api/control/playlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update playlist status");

      toast({
        kind: next === "active" ? "success" : "info",
        title: `Playlist ${next === "active" ? "Visible" : "Disabled"}`,
        description: `"${target.title}" is now ${next}.`,
      });
    } catch (err: any) {
      setPlaylists((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: target.status } : p))
      );
      toast({
        kind: "error",
        title: "Update Failed",
        description: err.message || "Could not update playlist status.",
      });
    }
  };

  const handleToggleAlbum = async (id: string) => {
    const target = albums.find((al) => al.id === id);
    if (!target) return;
    const next = target.status === "active" ? "inactive" : "active";

    setAlbums((prev) =>
      prev.map((al) => (al.id === id ? { ...al, status: next } : al))
    );

    try {
      const res = await fetch("/api/control/albums", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update album status");

      toast({
        kind: next === "active" ? "success" : "info",
        title: `Album ${next === "active" ? "Activated" : "Disabled"}`,
        description: `"${target.title}" status switched to ${next}.`,
      });
    } catch (err: any) {
      setAlbums((prev) =>
        prev.map((al) => (al.id === id ? { ...al, status: target.status } : al))
      );
      toast({
        kind: "error",
        title: "Update Failed",
        description: err.message || "Could not update album status.",
      });
    }
  };

  const handleSaveSongMedia = async (updatedSong: SongItem) => {
    try {
      let finalCoverImage = updatedSong.coverImage;
      if (finalCoverImage && finalCoverImage.startsWith("data:")) {
        finalCoverImage = await uploadMediaToStorage(finalCoverImage, `song-${updatedSong.id}-cover.jpg`);
      }

      const res = await fetch("/api/control/songs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedSong.id,
          coverImage: finalCoverImage,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update song cover image");

      const persistentCover = data.coverImage || finalCoverImage;
      setSongs((prev) =>
        prev.map((s) =>
          s.id === updatedSong.id
            ? { ...updatedSong, coverImage: persistentCover }
            : s
        )
      );
      toast({
        kind: "success",
        title: "Cover Image Updated",
        description: `Artwork updated for "${updatedSong.title}".`,
      });
      return true;
    } catch (err: any) {
      toast({
        kind: "error",
        title: "Update Failed",
        description: err.message || "Could not save cover image.",
      });
      return false;
    }
  };

  const handleSaveArtistMedia = async (updatedArtist: ArtistItem) => {
    try {
      let finalAvatar = updatedArtist.avatarUrl;
      let finalBanner = updatedArtist.bannerUrl;

      if (finalAvatar && finalAvatar.startsWith("data:")) {
        finalAvatar = await uploadMediaToStorage(finalAvatar, `artist-${updatedArtist.id}-avatar.jpg`);
      }
      if (finalBanner && finalBanner.startsWith("data:")) {
        finalBanner = await uploadMediaToStorage(finalBanner, `artist-${updatedArtist.id}-banner.jpg`);
      }

      const res = await fetch("/api/control/artists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedArtist.id,
          avatarUrl: finalAvatar,
          bannerUrl: finalBanner,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update artist media");

      setArtists((prev) =>
        prev.map((a) =>
          a.id === updatedArtist.id
            ? {
                ...updatedArtist,
                avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : finalAvatar,
                bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : finalBanner,
              }
            : a
        )
      );
      toast({
        kind: "success",
        title: "Artist Media Updated",
        description: `Avatar and banner updated for "${updatedArtist.name}".`,
      });
      return true;
    } catch (err: any) {
      toast({
        kind: "error",
        title: "Update Media Failed",
        description: err.message || "Could not save media updates.",
      });
      return false;
    }
  };

  const handleSavePlaylistMedia = async (updatedPlaylist: PlaylistItem) => {
    try {
      let finalCover = updatedPlaylist.coverUrl;
      let finalBanner = updatedPlaylist.bannerUrl;

      if (finalCover && finalCover.startsWith("data:")) {
        finalCover = await uploadMediaToStorage(finalCover, `playlist-${updatedPlaylist.id}-cover.jpg`);
      }
      if (finalBanner && finalBanner.startsWith("data:")) {
        finalBanner = await uploadMediaToStorage(finalBanner, `playlist-${updatedPlaylist.id}-banner.jpg`);
      }

      const res = await fetch("/api/control/playlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedPlaylist.id,
          coverUrl: finalCover,
          bannerUrl: finalBanner,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update playlist media");

      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === updatedPlaylist.id
            ? {
                ...updatedPlaylist,
                coverUrl: data.coverUrl !== undefined ? data.coverUrl : finalCover,
                bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : finalBanner,
              }
            : p
        )
      );
      toast({
        kind: "success",
        title: "Playlist Media Updated",
        description: `Artwork updated for "${updatedPlaylist.title}".`,
      });
      return true;
    } catch (err: any) {
      toast({
        kind: "error",
        title: "Update Media Failed",
        description: err.message || "Could not save playlist media.",
      });
      return false;
    }
  };

  const handleSaveAlbumMedia = async (updatedAlbum: AlbumItem) => {
    try {
      let finalCover = updatedAlbum.coverUrl;
      let finalBanner = updatedAlbum.bannerUrl;

      if (finalCover && finalCover.startsWith("data:")) {
        finalCover = await uploadMediaToStorage(finalCover, `album-${updatedAlbum.id}-cover.jpg`);
      }
      if (finalBanner && finalBanner.startsWith("data:")) {
        finalBanner = await uploadMediaToStorage(finalBanner, `album-${updatedAlbum.id}-banner.jpg`);
      }

      const res = await fetch("/api/control/albums", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedAlbum.id,
          coverUrl: finalCover,
          bannerUrl: finalBanner,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update album media");

      setAlbums((prev) =>
        prev.map((al) =>
          al.id === updatedAlbum.id
            ? {
                ...updatedAlbum,
                coverUrl: data.coverUrl !== undefined ? data.coverUrl : finalCover,
                bannerUrl: data.bannerUrl !== undefined ? data.bannerUrl : finalBanner,
              }
            : al
        )
      );
      toast({
        kind: "success",
        title: "Album Media Updated",
        description: `Artwork updated for "${updatedAlbum.title}".`,
      });
      return true;
    } catch (err: any) {
      toast({
        kind: "error",
        title: "Update Media Failed",
        description: err.message || "Could not save album media.",
      });
      return false;
    }
  };

  const handleAddSong = async (newTrack: Track) => {
    const tempId = `temp-upload-${Date.now()}`;
    const optimisticSongItem: SongItem = {
      id: tempId,
      title: newTrack.title,
      artist: newTrack.artist || "Independent Artist",
      album: newTrack.album || "Single",
      duration: newTrack.duration || 180,
      coverImage: newTrack.coverImage,
      hue: newTrack.hue || 24,
      uploadedBy: newTrack.uploadedBy || "You",
      status: "active",
      plays: 0,
      reportsCount: 0,
      isUploading: true,
    };

    setSongs((prev) => [optimisticSongItem, ...prev]);

    toast({
      kind: "info",
      title: "Uploading Song...",
      description: `"${newTrack.title}" — uploading audio and artwork to cloud storage.`,
    });

    try {
      let finalCover = newTrack.coverImage;
      if (finalCover && finalCover.startsWith("data:")) {
        try {
          finalCover = await uploadMediaToStorage(finalCover, `song-${Date.now()}-cover.jpg`);
        } catch (e: any) {
          console.warn("Song cover upload warning:", e.message);
        }
      }

      // Upload audio file via multipart BEFORE sending JSON to avoid 4.5MB Vercel limit
      let finalAudioUrl: string | undefined = (newTrack as any).audioSrc || (newTrack as any).audioUrl;
      if (finalAudioUrl && finalAudioUrl.startsWith("data:")) {
        try {
          finalAudioUrl = await uploadMediaToStorage(
            finalAudioUrl,
            `${newTrack.title.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}.mp3`
          );
        } catch (e: any) {
          console.warn("Song audio upload warning:", e.message);
          // Keep the data URL as fallback — server will handle it
          finalAudioUrl = undefined; // Don't send huge base64 in JSON
          throw new Error("Audio upload failed. Please try again.");
        }
      }

      const res = await fetch("/api/control/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTrack.title,
          artist: newTrack.artist,
          artistId: newTrack.artistId,
          album: newTrack.album,
          duration: newTrack.duration,
          coverImage: finalCover,
          hue: newTrack.hue,
          uploadedBy: newTrack.uploadedBy,
          audioUrl: finalAudioUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          openLoginModal();
        }
        throw new Error(data.error || "Failed to add song to database");
      }

      const savedSong: SongItem = data.song || {
        id: newTrack.id,
        title: newTrack.title,
        artist: newTrack.artist,
        album: newTrack.album,
        duration: newTrack.duration,
        coverImage: newTrack.coverImage,
        hue: newTrack.hue,
        uploadedBy: newTrack.uploadedBy || "Listenify Editorial",
        status: "active",
        plays: 0,
        reportsCount: 0,
      };

      setSongs((prev) =>
        prev.map((s) => (s.id === tempId ? { ...savedSong, isUploading: false } : s))
      );

      toast({
        kind: "success",
        title: "Song Uploaded & Published",
        description: `"${newTrack.title}" was saved successfully to cloud storage.`,
      });
    } catch (err: any) {
      setSongs((prev) => prev.filter((s) => s.id !== tempId));
      toast({
        kind: "error",
        title: "Upload Failed",
        description: err.message || "Error uploading song.",
      });
    }
  };

  const handleAddArtist = async (newArt: ArtistItem) => {
    try {
      let finalAvatar = newArt.avatarUrl;
      let finalBanner = newArt.bannerUrl;

      if (finalAvatar && finalAvatar.startsWith("data:")) {
        finalAvatar = await uploadMediaToStorage(finalAvatar, `artist-${Date.now()}-avatar.jpg`);
      }
      if (finalBanner && finalBanner.startsWith("data:")) {
        finalBanner = await uploadMediaToStorage(finalBanner, `artist-${Date.now()}-banner.jpg`);
      }

      const res = await fetch("/api/control/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newArt.name,
          genre: newArt.genre,
          avatarUrl: finalAvatar,
          bannerUrl: finalBanner,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          openLoginModal();
        }
        throw new Error(data.error || "Failed to create artist in database");
      }

      const savedArt = data.artist || { ...newArt, avatarUrl: finalAvatar, bannerUrl: finalBanner };
      setArtists((prev) => [savedArt, ...prev]);
      toast({
        kind: "success",
        title: "Artist Added",
        description: `${newArt.name} profile created successfully.`,
      });
    } catch (err: any) {
      toast({
        kind: "error",
        title: "Failed to Add Artist",
        description: err.message || "Error adding artist to database.",
      });
      throw err;
    }
  };

  const handleCreatePlaylist = async (newPl: Playlist) => {
    try {
      let finalCover = newPl.logo;           // Logo is the avatar/cover
      let finalBanner = newPl.coverImage;    // coverImage is the banner

      if (finalCover && finalCover.startsWith("data:")) {
        finalCover = await uploadMediaToStorage(finalCover, `playlist-${Date.now()}-cover.jpg`);
      }
      if (finalBanner && finalBanner.startsWith("data:")) {
        finalBanner = await uploadMediaToStorage(finalBanner, `playlist-${Date.now()}-banner.jpg`);
      }

      const res = await fetch("/api/control/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPl.title,
          description: newPl.description,
          coverUrl: finalCover,
          bannerUrl: finalBanner,
          isPublic: true,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          openLoginModal();
        }
        throw new Error(data.error || "Failed to create playlist in database");
      }

      const item: PlaylistItem = data.playlist || {
        id: newPl.id,
        title: newPl.title,
        creator: "Listenify Curator",
        songsCount: 0,
        status: "active",
        coverUrl: finalCover,
        bannerUrl: finalBanner,
        visibility: "public",
        hue: newPl.hue,
        description: newPl.description,
      };

      setPlaylists((prev) => [item, ...prev]);
      toast({
        kind: "success",
        title: "Playlist Created",
        description: `"${newPl.title}" has been published.`,
      });
    } catch (err: any) {
      toast({
        kind: "error",
        title: "Failed to Create Playlist",
        description: err.message || "Error creating playlist in database.",
      });
    }
  };

  const handleCreateAlbum = async (newAl: Album) => {
    try {
      let finalCover = newAl.coverImage || newAl.avatarUrl;
      let finalBanner = newAl.bannerUrl;

      if (finalCover && finalCover.startsWith("data:")) {
        finalCover = await uploadMediaToStorage(finalCover, `album-${Date.now()}-cover.jpg`);
      }
      if (finalBanner && finalBanner.startsWith("data:")) {
        finalBanner = await uploadMediaToStorage(finalBanner, `album-${Date.now()}-banner.jpg`);
      }

      const res = await fetch("/api/control/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAl.title,
          artist: newAl.artist,
          artistIds: newAl.artistIds || [],
          year: newAl.year,
          coverUrl: finalCover,
          bannerUrl: finalBanner,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          openLoginModal();
        }
        throw new Error(data.error || "Failed to create album in database");
      }

      const item: AlbumItem = data.album || {
        id: newAl.id,
        title: newAl.title,
        artist: newAl.artist,
        year: newAl.year,
        status: "active",
        coverUrl: finalCover,
        bannerUrl: finalBanner,
        hue: newAl.hue,
      };

      setAlbums((prev) => [item, ...prev]);
      toast({
        kind: "success",
        title: "Album Created",
        description: `"${newAl.title}" catalog edition published.`,
      });
    } catch (err: any) {
      toast({
        kind: "error",
        title: "Failed to Create Album",
        description: err.message || "Error creating album in database.",
      });
    }
  };

  const handleResolveReport = (id: string, action: "resolve" | "dismiss") => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, status: action === "resolve" ? "resolved" : "dismissed" };
        }
        return r;
      })
    );
    toast({
      kind: action === "resolve" ? "success" : "info",
      title: action === "resolve" ? "Report Resolved" : "Report Dismissed",
      description: `Action completed for report #${id}.`,
    });
  };

  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;
  const pendingCopyrightCount = reports.filter(
    (r) => r.isCopyright && r.status === "pending"
  ).length;

  return {
    songs,
    isLoadingSongs,
    artists,
    isLoadingArtists,
    playlists,
    isLoadingPlaylists,
    albums,
    isLoadingAlbums,
    reports,
    pendingReportsCount,
    pendingCopyrightCount,
    handleToggleSong,
    handleToggleArtist,
    handleTogglePlaylist,
    handleToggleAlbum,
    handleAddSong,
    handleAddArtist,
    handleCreatePlaylist,
    handleCreateAlbum,
    handleSaveSongMedia,
    handleSaveArtistMedia,
    handleSavePlaylistMedia,
    handleSaveAlbumMedia,
    handleResolveReport,
  };
}
