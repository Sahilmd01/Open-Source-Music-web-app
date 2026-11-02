"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/ui-store";
import {
  ControlHeader,
  ControlModals,
  useControlData,
  SongsTab,
  ArtistsTab,
  PlaylistsTab,
  AlbumsTab,
  ReportsTab,
  CopyrightReportsTab,
  type ControlTab,
  type SongItem,
  type ArtistItem,
  type PlaylistItem,
  type AlbumItem,
} from "@/components/control";

export default function AllControlPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading, user, openLoginModal } = useUiStore();
  const [activeTab, setActiveTab] = useState<ControlTab>("songs");
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.role === "admin";

  // Enforce admin-only access
  useEffect(() => {
    if (!isAuthLoading && (!isAuthenticated || !isAdmin)) {
      router.replace("/");
    }
  }, [isAuthLoading, isAuthenticated, isAdmin, router]);

  // Data fetching and mutations hook
  const {
    songs,
    isLoadingSongs,
    artists,
    playlists,
    albums,
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
  } = useControlData({ isAdmin, openLoginModal });

  // Modal open states
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [isAddArtistOpen, setIsAddArtistOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);

  // Edit media modal selections
  const [selectedArtistForMedia, setSelectedArtistForMedia] = useState<ArtistItem | null>(null);
  const [artistMediaModalOpen, setArtistMediaModalOpen] = useState(false);

  const [selectedPlaylistForMedia, setSelectedPlaylistForMedia] = useState<PlaylistItem | null>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const [selectedAlbumForMedia, setSelectedAlbumForMedia] = useState<AlbumItem | null>(null);
  const [albumMediaModalOpen, setAlbumMediaModalOpen] = useState(false);

  const [selectedSongForMedia, setSelectedSongForMedia] = useState<SongItem | null>(null);
  const [songMediaModalOpen, setSongMediaModalOpen] = useState(false);

  if (isAuthLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      {/* 1. Header with Tab Segments & Search */}
      <ControlHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        songsCount={songs.length}
        artistsCount={artists.length}
        playlistsCount={playlists.length}
        albumsCount={albums.length}
        pendingReportsCount={pendingReportsCount}
        pendingCopyrightCount={pendingCopyrightCount}
      />

      {/* 2. Active Section Tab */}
      {activeTab === "songs" && (
        <SongsTab
          songs={songs}
          searchQuery={searchQuery}
          onToggleSong={handleToggleSong}
          onOpenAddSong={() => {
            if (!isAuthenticated) return openLoginModal();
            setIsAddSongOpen(true);
          }}
          onEditMedia={(song) => {
            setSelectedSongForMedia(song);
            setSongMediaModalOpen(true);
          }}
          isLoading={isLoadingSongs}
        />
      )}

      {activeTab === "artists" && (
        <ArtistsTab
          artists={artists}
          searchQuery={searchQuery}
          onOpenAddModal={() => {
            if (!isAuthenticated) return openLoginModal();
            setIsAddArtistOpen(true);
          }}
          onToggleArtist={handleToggleArtist}
          onEditMedia={(art) => {
            setSelectedArtistForMedia(art);
            setArtistMediaModalOpen(true);
          }}
        />
      )}

      {activeTab === "playlists" && (
        <PlaylistsTab
          playlists={playlists}
          searchQuery={searchQuery}
          onOpenCreateModal={() => {
            if (!isAuthenticated) return openLoginModal();
            setIsCreatePlaylistOpen(true);
          }}
          onEditMedia={(pl) => {
            setSelectedPlaylistForMedia(pl);
            setMediaModalOpen(true);
          }}
          onTogglePlaylist={handleTogglePlaylist}
        />
      )}

      {activeTab === "albums" && (
        <AlbumsTab
          albums={albums}
          searchQuery={searchQuery}
          onOpenCreateModal={() => {
            if (!isAuthenticated) return openLoginModal();
            setIsCreateAlbumOpen(true);
          }}
          onEditMedia={(al) => {
            setSelectedAlbumForMedia(al);
            setAlbumMediaModalOpen(true);
          }}
          onToggleAlbum={handleToggleAlbum}
        />
      )}

      {activeTab === "reports" && (
        <ReportsTab
          reports={reports}
          searchQuery={searchQuery}
          onResolveReport={handleResolveReport}
        />
      )}

      {activeTab === "copyright-reports" && (
        <CopyrightReportsTab
          reports={reports}
          searchQuery={searchQuery}
          onResolveReport={handleResolveReport}
        />
      )}

      {/* 3. Modals */}
      <ControlModals
        isAddSongOpen={isAddSongOpen}
        onCloseAddSong={() => setIsAddSongOpen(false)}
        onAddSong={handleAddSong}
        isAddArtistOpen={isAddArtistOpen}
        onCloseAddArtist={() => setIsAddArtistOpen(false)}
        onAddArtist={handleAddArtist}
        artistMediaModalOpen={artistMediaModalOpen}
        selectedArtistForMedia={selectedArtistForMedia}
        onCloseArtistMedia={() => setArtistMediaModalOpen(false)}
        onSaveArtistMedia={handleSaveArtistMedia}
        isCreatePlaylistOpen={isCreatePlaylistOpen}
        onCloseCreatePlaylist={() => setIsCreatePlaylistOpen(false)}
        onCreatePlaylist={handleCreatePlaylist}
        mediaModalOpen={mediaModalOpen}
        selectedPlaylistForMedia={selectedPlaylistForMedia}
        onClosePlaylistMedia={() => setMediaModalOpen(false)}
        onSavePlaylistMedia={handleSavePlaylistMedia}
        isCreateAlbumOpen={isCreateAlbumOpen}
        onCloseCreateAlbum={() => setIsCreateAlbumOpen(false)}
        onCreateAlbum={handleCreateAlbum}
        albumMediaModalOpen={albumMediaModalOpen}
        selectedAlbumForMedia={selectedAlbumForMedia}
        onCloseAlbumMedia={() => setAlbumMediaModalOpen(false)}
        onSaveAlbumMedia={handleSaveAlbumMedia}
        songMediaModalOpen={songMediaModalOpen}
        selectedSongForMedia={selectedSongForMedia}
        onCloseSongMedia={() => setSongMediaModalOpen(false)}
        onSaveSongMedia={handleSaveSongMedia}
      />
    </div>
  );
}
