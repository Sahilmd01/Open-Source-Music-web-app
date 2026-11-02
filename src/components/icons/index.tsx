import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Base {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Base>
);
export const SettingsIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></Base>
);
export const BellIcon = (p: IconProps) => (
  <Base {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></Base>
);
export const HeartIcon = (p: IconProps) => (
  <Base {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" /></Base>
);
export const HeartFilledIcon = (p: IconProps) => (
  <Base fill="currentColor" {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" /></Base>
);
export const PlayIcon = (p: IconProps) => (
  <Base fill="currentColor" stroke="none" {...p}><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5Z" /></Base>
);
export const PauseIcon = (p: IconProps) => (
  <Base fill="currentColor" stroke="none" {...p}><rect x="6" y="5" width="4" height="14" rx="1.2" /><rect x="14" y="5" width="4" height="14" rx="1.2" /></Base>
);
export const PrevIcon = (p: IconProps) => (
  <Base fill="currentColor" stroke="none" {...p}><rect x="5" y="5" width="2.4" height="14" rx="1" /><path d="M19 6v12a.8.8 0 0 1-1.3.6l-8.4-6a.8.8 0 0 1 0-1.2l8.4-6A.8.8 0 0 1 19 6Z" /></Base>
);
export const NextIcon = (p: IconProps) => (
  <Base fill="currentColor" stroke="none" {...p}><rect x="16.6" y="5" width="2.4" height="14" rx="1" /><path d="M5 6v12a.8.8 0 0 0 1.3.6l8.4-6a.8.8 0 0 0 0-1.2l-8.4-6A.8.8 0 0 0 5 6Z" /></Base>
);
export const ShuffleIcon = (p: IconProps) => (
  <Base {...p}><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="M4 4l5 5" /></Base>
);
export const RepeatIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </Base>
);
export const QueueIcon = (p: IconProps) => (
  <Base {...p}><path d="M3 6h18" /><path d="M3 11h18" /><path d="M3 16h8" /><path d="m15 15 5 3-5 3Z" fill="currentColor" /></Base>
);
export const VolumeIcon = (p: IconProps) => (
  <Base {...p}><path d="M11 5 6 9H3v6h3l5 4Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></Base>
);
export const VolumeMuteIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M11 5 6 9H3v6h3l5 4Z" />
    <line x1="22" y1="9" x2="16" y2="15" />
    <line x1="16" y1="9" x2="22" y2="15" />
  </Base>
);
export const PlusIcon = (p: IconProps) => (
  <Base {...p}><path d="M12 5v14M5 12h14" /></Base>
);
export const PlaylistIcon = (p: IconProps) => (
  <Base {...p}><path d="M3 6h18M3 12h18M3 18h12" /></Base>
);
export const PlaylistAddIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 6h18M3 12h11M3 18h11" />
    <path d="M19 15v6M16 18h6" />
  </Base>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}><path d="m9 6 6 6-6 6" /></Base>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}><path d="m15 18-6-6 6-6" /></Base>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Base {...p}><path d="m12 19-7-7 7-7M19 12H5" /></Base>
);
export const EqualizerIcon = (p: IconProps) => (
  <Base {...p}><path d="M5 9v6M9 5v14M13 8v8M17 10v4M21 11v2" /></Base>
);
export const SunIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Base>
);
export const MoonIcon = (p: IconProps) => (
  <Base {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Base>
);
export const MenuIcon = (p: IconProps) => (
  <Base {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Base>
);
export const CheckIcon = (p: IconProps) => (
  <Base {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Base>
);
export const CloseIcon = (p: IconProps) => (
  <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>
);
export const InfoIcon = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></Base>
);
export const AlertIcon = (p: IconProps) => (
  <Base {...p}><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17v.01" /></Base>
);
export const MoreVerticalIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
  </Base>
);
export const FlagIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </Base>
);
export const Share2Icon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Base>
);
export const CopyrightIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M14.83 14.83a4 4 0 1 1 0-5.66" />
  </Base>
);
export const CameraIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </Base>
);
export const ImageIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </Base>
);
export const RotateCcwIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </Base>
);
export const RotateCwIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.99 6.57 2.57L21 8" />
    <path d="M21 3v5h-5" />
  </Base>
);
export const UploadCloudIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </Base>
);
export const MusicNoteIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Base>
);

export const GoogleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...p}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const LogOutIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Base>
);

export const ListenifyLogo = (p: SVGProps<SVGSVGElement>) => (
  <svg
    width={28}
    height={28}
    viewBox="0 0 512 512"
    fill="none"
    aria-hidden="true"
    focusable="false"
    className="listenify-brand-icon"
    {...p}
  >
    {/* Squircle Background: Black in light mode, White in dark mode */}
    <rect width="512" height="512" rx="128" className="listenify-brand-icon__bg" />
    {/* Soundwave Bars: White in light mode, Black in dark mode */}
    <g className="listenify-brand-icon__bars">
      <rect x="110" y="201" width="46" height="110" rx="23" />
      <rect x="192" y="128" width="46" height="256" rx="23" />
      <rect x="274" y="91" width="46" height="330" rx="23" />
      <rect x="356" y="174" width="46" height="164" rx="23" />
    </g>
  </svg>
);

export const LockIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Base>
);

export const UserIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Base>
);

export const SpinnerIcon = (p: IconProps) => (
  <Base {...p} style={{ animation: "spin 1s linear infinite", ...p.style }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Base>
);

export const DiscIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);



