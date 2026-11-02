export interface UserPreferences {
  normalizeAudio: boolean;
  gaplessPlayback: boolean;
  autoplayRelated: boolean;
  downloadsOverWifiOnly: boolean;
  highQualityStreaming: boolean;
  emailDigest: boolean;
  pushNewReleases: boolean;
  pushPlaylistUpdates: boolean;
  privateSession: boolean;
  publishActivity: boolean;
  compactSidebar: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  normalizeAudio: true,
  gaplessPlayback: true,
  autoplayRelated: true,
  downloadsOverWifiOnly: true,
  highQualityStreaming: true,
  emailDigest: false,
  pushNewReleases: true,
  pushPlaylistUpdates: true,
  privateSession: false,
  publishActivity: true,
  compactSidebar: false,
};

export const SETTINGS_STORAGE_KEY = "wavelength_user_settings_v1";

export type SettingsTab = "audio" | "notifications" | "privacy";
