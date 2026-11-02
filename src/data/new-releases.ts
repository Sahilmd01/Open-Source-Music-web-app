import type { Track, Album, Playlist } from "@/types/music";
import { TRACKS, ALBUMS, PLAYLISTS } from "@/data/mock";

export const NEW_RELEASE_TRACKS: Track[] = [
  {
    ...TRACKS[0]!,
    id: "nr-t1",
    title: "Snowfall (Acoustic Redux)",
    releaseDate: "Oct 24, 2026",
    uploadedBy: "Oneheart Official",
  },
  {
    ...TRACKS[4]!,
    id: "nr-t2",
    title: "Neon Hands (Night City Edit)",
    releaseDate: "Oct 22, 2026",
    uploadedBy: "Metro Vale",
  },
  {
    ...TRACKS[2]!,
    id: "nr-t3",
    title: "Apathy (Extended Horizon)",
    releaseDate: "Oct 19, 2026",
    uploadedBy: "Tezce Records",
  },
  {
    ...TRACKS[6]!,
    id: "nr-t4",
    title: "Paper Moons (Ambient Rework)",
    releaseDate: "Oct 15, 2026",
    uploadedBy: "Sable Quinn",
  },
  {
    ...TRACKS[1]!,
    id: "nr-t5",
    title: "Therapy (Midnight Tape)",
    releaseDate: "Oct 10, 2026",
    uploadedBy: "Oneheart Official",
  },
  {
    ...TRACKS[7]!,
    id: "nr-t6",
    title: "Low Tide (Harbor Echoes)",
    releaseDate: "Oct 05, 2026",
    uploadedBy: "Idris Vale",
  },
];

export const NEW_RELEASE_ALBUMS: Album[] = [
  {
    ...ALBUMS[0]!,
    id: "nr-al1",
    title: "Winter Rooms (Deluxe Edition)",
    releaseDate: "Released Oct 24, 2026",
  },
  {
    ...ALBUMS[2]!,
    id: "nr-al2",
    title: "After Dark (Continuous Mix)",
    releaseDate: "Released Oct 18, 2026",
  },
  {
    ...ALBUMS[1]!,
    id: "nr-al3",
    title: "Green Light Hours (2026 Master)",
    releaseDate: "Released Oct 12, 2026",
  },
  {
    ...ALBUMS[3]!,
    id: "nr-al4",
    title: "Switchback Sessions",
    releaseDate: "Released Sep 29, 2026",
  },
];

export const NEW_RELEASE_PLAYLISTS: Playlist[] = [
  {
    ...PLAYLISTS[0]!,
    id: "nr-pl1",
    title: "Chill Afternoon: Autumn 2026",
    releaseDate: "Updated Oct 25, 2026",
  },
  {
    ...PLAYLISTS[1]!,
    id: "nr-pl2",
    title: "Night Drive: Tokyo Neon",
    releaseDate: "Updated Oct 21, 2026",
  },
  {
    ...PLAYLISTS[2]!,
    id: "nr-pl3",
    title: "Deep Focus: Quantum Beats",
    releaseDate: "Updated Oct 16, 2026",
  },
  {
    ...PLAYLISTS[3]!,
    id: "nr-pl4",
    title: "Sunset Beats: Ibiza Sessions",
    releaseDate: "Updated Oct 08, 2026",
  },
];
