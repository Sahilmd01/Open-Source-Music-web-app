import type { Album, Artist, Playlist, Station, Track } from "@/types/music";

export const FEATURED_PLAYLIST: Playlist = {
  id: "pl-golden-hour",
  title: "Golden Hour",
  description: "Enjoy vivid emotions with this stunning music album. Each track is a story.",
  likes: 83012,
  songCount: 18,
  durationLabel: "39 min 43 sec",
  hue: 24,
  coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
};

export const PLAYLISTS: Playlist[] = [
  {
    id: "pl-chill-vibes",
    title: "Chill Afternoon",
    description: "Laidback lo-fi and calm acoustic tunes to unwind with warm breeze.",
    likes: 42109,
    songCount: 24,
    durationLabel: "1 hr 12 min",
    hue: 215,
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "pl-night-drive",
    title: "Night Drive",
    description: "Synthwave and neon rhythms for cruising empty midnight highways.",
    likes: 67320,
    songCount: 30,
    durationLabel: "1 hr 34 min",
    hue: 280,
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "pl-deep-focus",
    title: "Deep Focus",
    description: "Ambient soundscapes and soft frequencies for deep, uninterrupted work.",
    likes: 91400,
    songCount: 20,
    durationLabel: "54 min",
    hue: 165,
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "pl-sunset-beats",
    title: "Sunset Beats",
    description: "Warm soulful house and mellow tropical sunset grooves.",
    likes: 38750,
    songCount: 18,
    durationLabel: "48 min",
    hue: 35,
    coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "pl-morning-acoustic",
    title: "Morning Acoustic",
    description: "Bright sunny acoustic guitars and calm vocals to start the day.",
    likes: 52400,
    songCount: 22,
    durationLabel: "58 min",
    hue: 45,
    coverImage: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "pl-electric-dreams",
    title: "Electric Dreams",
    description: "Futuristic electro-pop and melodic synth landscapes.",
    likes: 64800,
    songCount: 26,
    durationLabel: "1 hr 18 min",
    hue: 295,
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
  },
];

export const ARTISTS: Artist[] = [
  {
    id: "a1",
    name: "Nova Reyes",
    hue: 200,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "a2",
    name: "Kade Mercer",
    hue: 265,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "a3",
    name: "Lio Marlowe",
    hue: 22,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "a4",
    name: "Sable Quinn",
    hue: 330,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "a5",
    name: "Idris Vale",
    hue: 150,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "a6",
    name: "Mira Okoye",
    hue: 48,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
];

export const TRACKS: Track[] = [
  { id: "t1", title: "Snowfall", artist: "Oneheart", album: "Winter Rooms", duration: 192, hue: 28 },
  { id: "t2", title: "Therapy", artist: "Oneheart", album: "Winter Rooms", duration: 122, hue: 205 },
  { id: "t3", title: "Apathy", artist: "Tezce", album: "Green Light Hours", duration: 122, hue: 160 },
  { id: "t4", title: "Look I'm Here", artist: "Oneheart", album: "Winter Rooms", duration: 122, hue: 195 },
  { id: "t5", title: "Neon Hands", artist: "Metro Vale", album: "After Dark", duration: 201, hue: 330 },
  { id: "t6", title: "Many Roads", artist: "Kade Mercer", album: "Switchback", duration: 149, hue: 8 },
  { id: "t7", title: "Paper Moons", artist: "Sable Quinn", album: "Paper Moons", duration: 233, hue: 280 },
  { id: "t8", title: "Low Tide", artist: "Idris Vale", album: "Harbor", duration: 176, hue: 180 },
];

export const RECENTLY_PLAYED: Track[] = [TRACKS[4]!, TRACKS[5]!, TRACKS[6]!, TRACKS[7]!];

export const ALBUMS: Album[] = [
  {
    id: "al1",
    title: "Winter Rooms",
    artist: "Oneheart",
    year: 2023,
    hue: 28,
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "al2",
    title: "Green Light Hours",
    artist: "Tezce",
    year: 2022,
    hue: 160,
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "al3",
    title: "After Dark",
    artist: "Metro Vale",
    year: 2024,
    hue: 330,
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "al4",
    title: "Switchback",
    artist: "Kade Mercer",
    year: 2021,
    hue: 8,
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "al5",
    title: "Paper Moons",
    artist: "Sable Quinn",
    year: 2023,
    hue: 280,
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "al6",
    title: "Harbor",
    artist: "Idris Vale",
    year: 2025,
    hue: 180,
    coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
  },
];


export const STATIONS: Station[] = [
  { id: "r1", name: "Late Night Drive", description: "Slow synths and open roads", hue: 265 },
  { id: "r2", name: "Focus Flow", description: "Instrumentals for deep work", hue: 200 },
  { id: "r3", name: "Sunday Kitchen", description: "Warm, easy, a little bit soulful", hue: 28 },
  { id: "r4", name: "Hype Room", description: "High energy for the gym", hue: 350 },
];

export const FAVORITE_TRACK_IDS = ["t1", "t5", "t7"];
