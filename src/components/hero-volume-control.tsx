"use client";

import { useEffect, useState } from "react";

function VolumeIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 14h4l5 4V6L8 10H4v4Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
        <path
          d="m18 9-6 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="m12 9 6 6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 14h4l5 4V6L8 10H4v4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M17 8c1.333 1.1 2 2.433 2 4s-.667 2.9-2 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M15 10c.667.533 1 1.2 1 2s-.333 1.467-1 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function HeroVolumeControl({ videoId }: { videoId?: string }) {
  const [volume, setVolume] = useState(65);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!videoId || typeof document === "undefined") {
      return;
    }

    const video = document.getElementById(videoId) as HTMLVideoElement | null;

    if (!video) {
      return;
    }

    video.muted = muted || volume === 0;
    video.volume = volume / 100;
  }, [muted, videoId, volume]);

  function toggleMute() {
    const nextMuted = !muted;
    setMuted(nextMuted);

    if (!videoId || typeof document === "undefined") {
      return;
    }

    const video = document.getElementById(videoId) as HTMLVideoElement | null;

    if (!video) {
      return;
    }

    video.muted = nextMuted;
  }

  return (
    <div className="group relative flex items-end">
      <div className="pointer-events-none absolute bottom-16 right-0 flex h-0 w-14 items-end justify-center overflow-hidden opacity-0 transition-all duration-300 group-hover:h-40 group-hover:opacity-100 group-focus-within:h-40 group-focus-within:opacity-100">
        <div className="pointer-events-auto flex h-36 w-14 items-center justify-center rounded-[2rem] border border-white/10 bg-black/70 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <input
            aria-label="Régler le volume"
            className="volume-slider"
            max="100"
            min="0"
            onChange={(event) => {
              const nextVolume = Number(event.target.value);
              setVolume(nextVolume);
              setMuted(nextVolume === 0);
            }}
            type="range"
            value={volume}
          />
        </div>
      </div>

      <button
        aria-label="Volume"
        className="sound-circle"
        onClick={toggleMute}
        type="button"
      >
        <VolumeIcon muted={muted || volume === 0} />
      </button>
    </div>
  );
}
