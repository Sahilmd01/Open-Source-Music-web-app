export type ControlTab = "songs" | "artists" | "playlists" | "albums" | "reports" | "copyright-reports";

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  hue?: number;
  coverImage?: string;
  uploadedBy?: string;
  status: "active" | "inactive";
  plays: number;
  reportsCount: number;
  isUploading?: boolean;
}

export interface ArtistItem {
  id: string;
  name: string;
  genre: string;
  status: "active" | "inactive";
  followers: number;
  avatarUrl: string;
  bannerUrl?: string;
  hue?: number;
}

export interface PlaylistItem {
  id: string;
  title: string;
  creator: string;
  songsCount: number;
  status: "active" | "inactive";
  coverUrl: string;
  bannerUrl: string;
  visibility: "public" | "private";
  hue?: number;
  description?: string;
}

export interface AlbumItem {
  id: string;
  title: string;
  artist: string;
  artistIds?: string[];
  artists?: Array<{ id: string; name: string; avatarUrl?: string }>;
  year: number;
  status: "active" | "inactive";
  coverUrl: string;
  bannerUrl?: string;
  hue?: number;
}

export interface ReportItem {
  id: string;
  targetType: "Song" | "Artist" | "Playlist" | "User";
  targetTitle: string;
  reportedBy: string;
  reason: string;
  date: string;
  status: "pending" | "resolved" | "dismissed";
  severity: "high" | "medium" | "low";
  isCopyright?: boolean;
  claimantName?: string;
}
