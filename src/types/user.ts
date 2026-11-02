import type { Playlist } from "./music";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  phone: string;
  joinedDate: string;
  isVerified: boolean;
  isBanned?: boolean;
  warnings?: string[];
  playlistsCount: number;
  followersCount?: number;
  followingCount?: number;
  favoriteGenre?: string;
  playlists?: Playlist[];
}

export type MockUser = User;
