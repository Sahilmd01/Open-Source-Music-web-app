"use client";

import { CoverArt } from "@/components/ui/cover-art";
import { IconButton } from "@/components/ui/icon-button";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, QueueIcon, RepeatIcon, ShuffleIcon, SpinnerIcon, VolumeIcon, VolumeMuteIcon } from "@/components/icons";
import { usePlayerClock } from "@/hooks/use-player-clock";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { selectCurrentTrack, usePlayerStore } from "@/stores/player-store";
import { Waveform } from "./waveform";

export function PlayerBar() {
  usePlayerClock();

  const track = usePlayerStore(selectCurrentTrack);
  const { isPlaying, isBuffering, progress, shuffle, repeat, volume } = usePlayerStore((s) => s);
  const { toggle, next, previous, seek, toggleShuffle, toggleRepeat, setVolume, toggleMute } = usePlayerStore((s) => s);

  if (!track) return null;

  return (
    <section
      className="player"
      aria-label="Music player"
      style={{
        ["--cover-art-url" as any]: track.coverImage ? `url("${track.coverImage}")` : "none",
        ["--track-hue" as any]: `${track.hue ?? 24}`,
      }}
      suppressHydrationWarning
    >
      {/* Mobile-only seekable progress bar — smooth touch/mouse scrub & drag */}
      <div
        className="player__mobile-progress"
        role="slider"
        aria-label="Seek track"
        aria-valuemin={0}
        aria-valuemax={track.duration}
        aria-valuenow={progress}
        tabIndex={0}
        onPointerDown={(e) => {
          const target = e.currentTarget;
          target.setPointerCapture(e.pointerId);
          const handleSeek = (clientX: number) => {
            const rect = target.getBoundingClientRect();
            if (rect.width <= 0) return;
            const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            seek(ratio * track.duration);
          };
          handleSeek(e.clientX);

          const onPointerMove = (ev: PointerEvent) => {
            handleSeek(ev.clientX);
          };

          const onPointerUp = (ev: PointerEvent) => {
            try {
              target.releasePointerCapture(ev.pointerId);
            } catch {}
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerUp);
          };

          window.addEventListener("pointermove", onPointerMove);
          window.addEventListener("pointerup", onPointerUp);
          window.addEventListener("pointercancel", onPointerUp);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") seek(Math.min(track.duration, progress + 5));
          if (e.key === "ArrowLeft") seek(Math.max(0, progress - 5));
        }}
        suppressHydrationWarning
      >
        <div
          className="player__mobile-progress-fill"
          style={{ width: `${track.duration > 0 ? (progress / track.duration) * 100 : 0}%` }}
          suppressHydrationWarning
        />
        <div
          className="player__mobile-progress-thumb"
          style={{ left: `${track.duration > 0 ? (progress / track.duration) * 100 : 0}%` }}
          suppressHydrationWarning
        />
      </div>

      <div className="player__track" suppressHydrationWarning>
        <CoverArt hue={track.hue} src={track.coverImage} size={44} className="track__cover" />
        <div className="player__meta" suppressHydrationWarning>
          <span className="player__artist">{track.artist}</span>
          <span className="player__title">{track.title}</span>
        </div>
      </div>

      <div className="player__controls" suppressHydrationWarning>
        <IconButton
          label={shuffle ? "Turn shuffle off" : "Turn shuffle on"}
          title={shuffle ? "Shuffle: On" : "Shuffle: Off"}
          aria-pressed={shuffle}
          onClick={toggleShuffle}
          className={cn("player__btn-shuffle", shuffle && "is-on")}
        >
          <ShuffleIcon />
        </IconButton>
        <IconButton label="Previous track" title="Previous track" onClick={previous}><PrevIcon /></IconButton>
        <button
          type="button"
          className="btn-play"
          aria-label={isBuffering ? "Buffering..." : isPlaying ? "Pause" : "Play"}
          title={isBuffering ? "Loading audio..." : isPlaying ? "Pause" : "Play"}
          onClick={toggle}
        >
          {isBuffering ? <SpinnerIcon width={18} height={18} /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <IconButton label="Next track" title="Next track" onClick={next}><NextIcon /></IconButton>
        <IconButton
          label={repeat ? "Turn repeat off" : "Turn repeat on"}
          title={repeat ? "Repeat: On" : "Repeat: Off"}
          aria-pressed={repeat}
          onClick={toggleRepeat}
          className={cn("player__btn-repeat", repeat && "is-on")}
        >
          <RepeatIcon />
        </IconButton>
      </div>

      <Waveform ratio={progress / track.duration} duration={track.duration} current={progress} onSeek={seek} />

      <span className="player__time tabular">
        <span className="player__time-current">{formatTime(progress, true)}</span>
        <span className="player__time-sep"> / </span>
        <span className="player__time-total">{formatTime(track.duration, true)}</span>
      </span>

      <div className="player__extras" suppressHydrationWarning>
        <IconButton label="Queue" title="Queue"><QueueIcon /></IconButton>
        <div className="player__volume" title={volume === 0 ? "Muted — click to unmute" : `Volume: ${Math.round(volume * 100)}% — click to mute`}>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={volume === 0 ? "Unmute" : "Mute"}
            title={volume === 0 ? "Unmute" : "Mute"}
            style={{
              background: "transparent",
              border: 0,
              padding: 0,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: volume === 0 ? "var(--text-muted)" : "inherit",
              transition: "transform 0.1s ease, color 0.15s ease",
            }}
          >
            {volume === 0 ? <VolumeMuteIcon width={20} height={20} /> : <VolumeIcon width={20} height={20} />}
          </button>
          <span className="sr-only">Volume</span>
          <input
            className="range"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume slider"
          />
        </div>
      </div>
    </section>
  );
}
