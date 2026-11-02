export const SITE_NAME = "Listenify";
export const SITE_DESCRIPTION = "Listenify — Stream your favorite music, trending playlists, curated albums, and top artists with high-fidelity sound and an editorial experience.";
export const THEME_STORAGE_KEY = "theme";

export interface NavLink {
  label: string;
  href: string;
}

export const LIBRARY_NAV: NavLink[] = [
  { label: "Browse", href: "/" },
  { label: "New Releases", href: "/new" },
  { label: "Songs", href: "/songs" },
  { label: "Albums", href: "/albums" },
  { label: "Artists", href: "/artists" },
  { label: "Playlists", href: "/playlists" },
  { label: "All Users", href: "/users" },
];

export const MY_MUSIC_NAV: NavLink[] = [
  { label: "Recently Played", href: "/recently-played" },
  { label: "Favorites", href: "/favorites" },
  { label: "Local File", href: "/local-files" },
  { label: "Settings", href: "/settings" },
  { label: "All Control", href: "/control" },
];

export const TOP_TABS = ["New Releases"] as const;

export const PAGE_TITLES: Record<string, string> = {
  "/": "Browse",
  "/songs": "Songs",
  "/albums": "Albums",
  "/artists": "Artists",
  "/playlists": "Playlists",
  "/users": "All Users",
  "/radio": "Radio",
  "/recently-played": "Recently Played",
  "/favorites": "Favorites",
  "/local-files": "Local File",
  "/new": "New Releases",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/search": "Search",
  "/profile": "My Profile",
  "/control": "All Control",
  "/design-system": "Design system",
};
