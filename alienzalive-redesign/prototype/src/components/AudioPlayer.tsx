"use client";

import { useEffect, useRef, useState } from "react";

export type Track = {
  title: string;
  artist?: string;
  audioUrl: string;
  cover?: string | null;
};

/*
 * Modern replacement for the Sonaar sticky player: play/pause, track list,
 * scrub, skip — fully keyboard-operable.
 *
 * IMPORTANT (audit finding): the live site hosts NO audio files. The Sonaar
 * player chrome loads with empty playlist templates on every page; actual
 * listening happens via outbound fvr.fan / aux.bio smart links and YouTube.
 * This component is therefore built and documented but only renders when a
 * page supplies real tracks with audioUrl — no placeholder audio is shipped.
 */
export default function AudioPlayer({ tracks }: { tracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const track = tracks[current];

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) void el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, current]);

  if (!tracks.length) return null;

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="border border-line bg-bg-raised p-6" role="region" aria-label="Audio player">
      <audio
        ref={audioRef}
        src={track.audioUrl}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() =>
          current < tracks.length - 1 ? setCurrent(current + 1) : setPlaying(false)
        }
      />
      <div className="flex items-center gap-4">
        {track.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.cover} alt="" className="h-14 w-14 object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <p className="display truncate text-lg">{track.title}</p>
          {track.artist && <p className="meta text-ink-dim">{track.artist}</p>}
        </div>
        <button
          type="button"
          className="meta border border-line px-3 py-2 hover:border-accent hover:text-accent disabled:opacity-40"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          aria-label="Previous track"
        >
          ⏮
        </button>
        <button
          type="button"
          className="display h-12 w-12 rounded-full bg-accent text-accent-ink"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          className="meta border border-line px-3 py-2 hover:border-accent hover:text-accent disabled:opacity-40"
          onClick={() => setCurrent(Math.min(tracks.length - 1, current + 1))}
          disabled={current === tracks.length - 1}
          aria-label="Next track"
        >
          ⏭
        </button>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="meta w-12 text-ink-dim">{fmt(progress)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={1}
          value={progress}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = t;
            setProgress(t);
          }}
          className="flex-1 accent-[var(--color-accent)]"
          aria-label="Seek"
        />
        <span className="meta w-12 text-right text-ink-dim">{fmt(duration)}</span>
      </div>
      {tracks.length > 1 && (
        <ol className="mt-5 border-t border-line" role="list">
          {tracks.map((t, i) => (
            <li key={t.audioUrl} className="index-row">
              <button
                type="button"
                onClick={() => {
                  setCurrent(i);
                  setPlaying(true);
                }}
                aria-current={i === current}
                className="flex w-full items-baseline gap-4 py-3 text-left"
              >
                <span className="meta w-6 text-ink-faint">{i + 1}</span>
                <span className={`row-title ${i === current ? "text-accent" : ""}`}>
                  {t.title}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
