export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "release" | "playlist" | "system" | "social";
  timestamp: string;
  read: boolean;
  avatar?: string;
  actionHref?: string;
  actionLabel?: string;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Single Dropped!",
    message: "Oneheart just released a brand new single 'Snowfall (Acoustic Redux)'. Listen to it now in New Releases.",
    category: "release",
    timestamp: "12m ago",
    read: false,
    avatar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
    actionHref: "/new",
    actionLabel: "Listen Now",
  },
  {
    id: "notif-2",
    title: "Playlist Updated",
    message: "Your favorite playlist 'Chill Afternoon' was refreshed with 4 fresh ambient lo-fi tracks.",
    category: "playlist",
    timestamp: "2h ago",
    read: false,
    avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    actionHref: "/playlists/pl-chill-vibes",
    actionLabel: "View Playlist",
  },
  {
    id: "notif-3",
    title: "Metro Vale Dropped An Album",
    message: "The full continuous mix of 'After Dark' is now streaming in high fidelity audio.",
    category: "release",
    timestamp: "5h ago",
    read: false,
    avatar: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80",
    actionHref: "/albums/al3",
    actionLabel: "View Album",
  },
  {
    id: "notif-4",
    title: "Local File Upload Complete",
    message: "Your uploaded audio files were processed and synced to your local files library successfully.",
    category: "system",
    timestamp: "1d ago",
    read: true,
    actionHref: "/local-files",
    actionLabel: "Open Local Files",
  },
  {
    id: "notif-5",
    title: "Weekly Music Radar",
    message: "We curated 20 new tracks based on your recent listening habits with Tezce, Sable Quinn & Idris Vale.",
    category: "social",
    timestamp: "2d ago",
    read: true,
    avatar: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    actionHref: "/new",
    actionLabel: "Discover Radar",
  },
  {
    id: "notif-6",
    title: "System Update: High Fidelity Equalizer",
    message: "Wavelength audio engine has been updated with enhanced stereo widening and waveform rendering.",
    category: "system",
    timestamp: "3d ago",
    read: true,
  },
];
