export interface ProfileData {
  name: string;
  username: string;
  bio: string;
  phone: string;
  email: string;
  avatarUrl: string;
  bannerUrl: string;
  joinedDate: string;
  isVerified?: boolean;
  followersCount: number;
  followingCount: number;
  playlistsCount: number;
}

export const DEFAULT_AVATAR_PATH = "/default/default-user-avatar.avif";
export const DEFAULT_BANNER_PATH = "/default/default-user-banner.png";

export const INITIAL_PROFILE: ProfileData = {
  name: "",
  username: "",
  bio: "",
  phone: "",
  email: "",
  avatarUrl: DEFAULT_AVATAR_PATH,
  bannerUrl: DEFAULT_BANNER_PATH,
  joinedDate: "",
  isVerified: false,
  followersCount: 0,
  followingCount: 0,
  playlistsCount: 0,
};

export const PROFILE_STORAGE_KEY = "listenify_user_profile_v1";

export type ProfileTab = "general" | "avatar-banner" | "security";
