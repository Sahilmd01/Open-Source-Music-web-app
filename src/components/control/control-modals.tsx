"use client";

import { AddMusicModal } from "@/components/features/add-music-modal";
import { CreatePlaylistModal } from "@/app/(app)/playlists/create-playlist-modal";
import { CreateAlbumModal } from "@/app/(app)/albums/create-album-modal";
import { AddArtistModal } from "./add-artist-modal";
import { EditArtistMediaModal } from "./edit-artist-media-modal";
import { EditPlaylistMediaModal } from "./edit-playlist-media-modal";
import { EditAlbumMediaModal } from "./edit-album-media-modal";
import { EditSongMediaModal } from "./edit-song-media-modal";
import type { SongItem, ArtistItem, PlaylistItem, AlbumItem } from "./control-types";
import type { Playlist, Album, Track } from "@/types/music";

interface ControlModalsProps {
  // Add song modal
  isAddSongOpen: boolean;
  onCloseAddSong: () => void;
  onAddSong: (track: Track) => Promise<void>;

  // Add artist modal
  isAddArtistOpen: boolean;
  onCloseAddArtist: () => void;
  onAddArtist: (artist: ArtistItem) => Promise<void>;

  // Edit artist media modal
  artistMediaModalOpen: boolean;
  selectedArtistForMedia: ArtistItem | null;
  onCloseArtistMedia: () => void;
  onSaveArtistMedia: (artist: ArtistItem) => Promise<boolean>;

  // Create playlist modal
  isCreatePlaylistOpen: boolean;
  onCloseCreatePlaylist: () => void;
  onCreatePlaylist: (playlist: Playlist) => Promise<void>;

  // Edit playlist media modal
  mediaModalOpen: boolean;
  selectedPlaylistForMedia: PlaylistItem | null;
  onClosePlaylistMedia: () => void;
  onSavePlaylistMedia: (playlist: PlaylistItem) => Promise<boolean>;

  // Create album modal
  isCreateAlbumOpen: boolean;
  onCloseCreateAlbum: () => void;
  onCreateAlbum: (album: Album) => Promise<void>;

  // Edit album media modal
  albumMediaModalOpen: boolean;
  selectedAlbumForMedia: AlbumItem | null;
  onCloseAlbumMedia: () => void;
  onSaveAlbumMedia: (album: AlbumItem) => Promise<boolean>;

  // Edit song media modal
  songMediaModalOpen: boolean;
  selectedSongForMedia: SongItem | null;
  onCloseSongMedia: () => void;
  onSaveSongMedia: (song: SongItem) => Promise<boolean>;
}

export function ControlModals({
  isAddSongOpen,
  onCloseAddSong,
  onAddSong,
  isAddArtistOpen,
  onCloseAddArtist,
  onAddArtist,
  artistMediaModalOpen,
  selectedArtistForMedia,
  onCloseArtistMedia,
  onSaveArtistMedia,
  isCreatePlaylistOpen,
  onCloseCreatePlaylist,
  onCreatePlaylist,
  mediaModalOpen,
  selectedPlaylistForMedia,
  onClosePlaylistMedia,
  onSavePlaylistMedia,
  isCreateAlbumOpen,
  onCloseCreateAlbum,
  onCreateAlbum,
  albumMediaModalOpen,
  selectedAlbumForMedia,
  onCloseAlbumMedia,
  onSaveAlbumMedia,
  songMediaModalOpen,
  selectedSongForMedia,
  onCloseSongMedia,
  onSaveSongMedia,
}: ControlModalsProps) {
  return (
    <>
      <AddMusicModal
        open={isAddSongOpen}
        containerTitle="Catalog Management"
        onClose={onCloseAddSong}
        onAddTrack={onAddSong}
      />

      <AddArtistModal
        open={isAddArtistOpen}
        onClose={onCloseAddArtist}
        onAdd={onAddArtist}
      />

      <EditArtistMediaModal
        open={artistMediaModalOpen}
        artist={selectedArtistForMedia}
        onClose={onCloseArtistMedia}
        onSave={async (art) => {
          const success = await onSaveArtistMedia(art);
          if (success) onCloseArtistMedia();
        }}
      />

      <CreatePlaylistModal
        open={isCreatePlaylistOpen}
        onClose={onCloseCreatePlaylist}
        onCreate={async (pl) => {
          await onCreatePlaylist(pl);
          onCloseCreatePlaylist();
        }}
      />

      <EditPlaylistMediaModal
        open={mediaModalOpen}
        playlist={selectedPlaylistForMedia}
        onClose={onClosePlaylistMedia}
        onSave={async (pl) => {
          const success = await onSavePlaylistMedia(pl);
          if (success) onClosePlaylistMedia();
        }}
      />

      <CreateAlbumModal
        open={isCreateAlbumOpen}
        onClose={onCloseCreateAlbum}
        onCreate={async (alb) => {
          await onCreateAlbum(alb);
          onCloseCreateAlbum();
        }}
      />

      <EditAlbumMediaModal
        open={albumMediaModalOpen}
        album={selectedAlbumForMedia}
        onClose={onCloseAlbumMedia}
        onSave={async (alb) => {
          const success = await onSaveAlbumMedia(alb);
          if (success) onCloseAlbumMedia();
        }}
      />

      <EditSongMediaModal
        open={songMediaModalOpen}
        song={selectedSongForMedia}
        onClose={onCloseSongMedia}
        onSave={async (song) => {
          const success = await onSaveSongMedia(song);
          if (success) onCloseSongMedia();
        }}
      />
    </>
  );
}
