export interface Artist {
  id: string;
  name: string;
  hue: number;
  image?: string;
  bannerUrl?: string;
  bio?: string;
  followers?: number;
  songCount?: number;
  totalLikes?: number;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  /** Duration in seconds */
  duration: number;
  hue: number;
  audioSrc?: string;
  audioUrl?: string;
  audioFile?: File;
  coverImageFile?: File;
  uploadedBy?: string;
  coverImage?: string;
  isCustom?: boolean;
  releaseDate?: string;
  isUploading?: boolean;
  likesCount?: number;
  playsCount?: number;
}


export interface Album {
  id: string;
  title: string;
  artist: string;
  artistIds?: string[];
  artists?: Array<{ id: string; name: string; avatarUrl?: string }>;
  year: number;
  hue: number;
  coverImage?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isCustom?: boolean;
  description?: string;
  releaseDate?: string;
  createdBy?: string;
  songCount?: number;
  totalLikes?: number;
}



export interface Station {
  id: string;
  name: string;
  description: string;
  hue: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  likes: number;
  songCount: number;
  durationLabel: string;
  hue?: number;
  gradient?: string;
  coverImage?: string;
  logo?: string;
  isCustom?: boolean;
  isPublic?: boolean;
  releaseDate?: string;
  ownerId?: string;
}

