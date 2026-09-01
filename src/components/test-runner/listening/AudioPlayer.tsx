/**
 * Retry-Safe Audio Player Component
 * Handles playback controls, buffered progress, replay limit enforcement, and network error recovery.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AudioInteractionLog } from '@/lib/audio/audio-service';

export interface AudioPlayerProps {
  audioUrl: string;
  maxPlays?: number; // e.g. 1 or 2 (TOEFL listening items usually limit replays)
  onInteractionChange?: (log: AudioInteractionLog) => void;
  disabled?: boolean;
  autoPlay?: boolean;
}

export function AudioPlayer({
  audioUrl,
  maxPlays = 2,
  onInteractionChange,
  disabled = false,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const interactionRef = useRef<AudioInteractionLog>({
    playCount: 0,
    replayCount: 0,
    completedListen: false,
    timeListenedMs: 0,
  });

  const notifyInteraction = useCallback(() => {
    if (onInteractionChange) {
      onInteractionChange({ ...interactionRef.current });
    }
  }, [onInteractionChange]);

  // Handle source changes & autoPlay
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setCurrentTime(0);
    setIsPlaying(false);

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioUrl;
    audio.load();

    if (autoPlay && !disabled) {
      audio.play().catch(() => {
        // Browser autoplay policy blocked - user interaction required
        setIsPlaying(false);
      });
    }
  }, [audioUrl, autoPlay, disabled]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);

    // Track buffer progress
    if (audio.buffered.length > 0) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const total = audio.duration || 1;
      setBufferedPercent((bufferedEnd / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || 0);
    setIsLoading(false);
  };

  const handlePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const remainingPlays = maxPlays - playCount;
    if (remainingPlays <= 0) return;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        if (playCount === 0) {
          interactionRef.current.firstPlayedAt = new Date().toISOString();
        }
        interactionRef.current.playCount += 1;
        interactionRef.current.lastPlayedAt = new Date().toISOString();
        if (playCount > 0) {
          interactionRef.current.replayCount += 1;
        }
        setPlayCount((prev) => prev + 1);
        notifyInteraction();
      })
      .catch((err) => {
        setError('Playback was blocked or interrupted. Click play to listen.');
        setIsPlaying(false);
      });
  };

  const handlePause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    interactionRef.current.completedListen = true;
    interactionRef.current.timeListenedMs += (duration || 0) * 1000;
    notifyInteraction();
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    const audio = audioRef.current;
    if (audio) {
      audio.load();
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const remainingPlays = Math.max(0, maxPlays - playCount);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 space-y-3">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => {
          setIsLoading(false);
          setError('Failed to load audio stream. Please check network connection.');
        }}
      />

      {/* Status & Replay Allowance Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-2">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Volume2 className="size-4 text-primary" />
          <span>Audio Prompt</span>
        </div>
        <span className="rounded bg-surface-2 px-2 py-0.5 font-semibold text-[11px]">
          Plays Remaining: <strong className="text-primary">{remainingPlays}</strong> of {maxPlays}
        </span>
      </div>

      {/* Error state */}
      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleRetry}>
            <RotateCcw className="size-3.5 mr-1" /> Retry
          </Button>
        </div>
      ) : null}

      {/* Playback Controls & Progress */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={disabled || isLoading || (remainingPlays <= 0 && !isPlaying)}
          onClick={isPlaying ? handlePause : handlePlay}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5 ml-0.5" />
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 space-y-1.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-2">
            {/* Buffer bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-primary/20 transition-all duration-300"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Play progress bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-primary transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
