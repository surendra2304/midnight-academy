/**
 * Retry-Safe Audio Player Component
 * Supports HTML5 Audio playback with seamless fallback to Web Speech API (SpeechSynthesis)
 * when audio files are blocked, missing, or sound-effect placeholders.
 * Handles playback controls, buffered progress, replay limits, and state cleanup.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, AlertCircle, Loader2 } from "lucide-react";
import type { AudioInteractionLog } from "@/lib/audio/audio-service";

export interface AudioPlayerProps {
  audioUrl?: string | undefined;
  speechText?: string | undefined;
  maxPlays?: number | undefined; // e.g. 1 or 2 (TOEFL listening items limit replays)
  onInteractionChange?: ((log: AudioInteractionLog) => void) | undefined;
  disabled?: boolean | undefined;
  autoPlay?: boolean | undefined;
}

export function AudioPlayer({
  audioUrl,
  speechText,
  maxPlays = 2,
  onInteractionChange,
  disabled = false,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [mode, setMode] = useState<"audio" | "speech">("audio");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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

  // Clean stop all audio and speech synthesis
  const stopAll = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Estimate speech duration: roughly 140 words per minute
  const estimateSpeechDuration = useCallback((text: string) => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(4, Math.round((wordCount / 140) * 60));
  }, []);

  // Initialize or reset when props change
  useEffect(() => {
    stopAll();
    setCurrentTime(0);
    setPlayCount(0);
    setError(null);
    interactionRef.current = {
      playCount: 0,
      replayCount: 0,
      completedListen: false,
      timeListenedMs: 0,
    };

    // If audioUrl is an .ogg sound effect or empty, prefer speech synthesis directly
    const isSoundEffectUrl =
      audioUrl?.includes("actions.google.com") ||
      audioUrl?.includes("clock_ticking") ||
      audioUrl?.includes("radiation_monitor") ||
      audioUrl?.includes("car_horn") ||
      audioUrl?.includes("applause_cheering");

    if ((!audioUrl || isSoundEffectUrl) && speechText) {
      setMode("speech");
      setDuration(estimateSpeechDuration(speechText));
      setIsLoading(false);
      return;
    }

    if (audioUrl) {
      setMode("audio");
      setIsLoading(true);
      const audio = audioRef.current;
      if (audio) {
        audio.src = audioUrl;
        audio.load();

        // Safety timeout: if audio doesn't load metadata in 3 seconds, switch to speech synthesis
        const timeout = setTimeout(() => {
          if (speechText) {
            console.warn("[AudioPlayer] Audio load timed out, falling back to SpeechSynthesis.");
            setMode("speech");
            setDuration(estimateSpeechDuration(speechText));
            setIsLoading(false);
          }
        }, 3000);

        return () => clearTimeout(timeout);
      }
    } else if (speechText) {
      setMode("speech");
      setDuration(estimateSpeechDuration(speechText));
      setIsLoading(false);
    }

    return () => {
      stopAll();
    };
  }, [audioUrl, speechText, stopAll, estimateSpeechDuration]);

  // Audio element event handlers
  const handleTimeUpdate = () => {
    if (mode === "audio" && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mode === "audio" && audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
    interactionRef.current.completedListen = true;
    interactionRef.current.timeListenedMs += (duration || 0) * 1000;
    notifyInteraction();
  };

  const handleAudioError = () => {
    // If audio element errors out and speechText exists, fall back immediately
    if (speechText) {
      console.warn("[AudioPlayer] Audio element error, switching to SpeechSynthesis fallback.");
      setMode("speech");
      setDuration(estimateSpeechDuration(speechText));
      setIsLoading(false);
      setError(null);
    } else {
      setIsLoading(false);
      setError("Unable to play audio. Please check network connection.");
    }
  };

  // Playback handlers
  const startSpeechSynthesis = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !speechText) {
      setError("Speech synthesis is not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.95; // Clear academic pacing
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    const estDuration = estimateSpeechDuration(speechText);
    setDuration(estDuration);

    // Always reset progress bar to 0 at the start of every play / replay
    setCurrentTime(0);

    let elapsed = 0;
    if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    speechTimerRef.current = setInterval(() => {
      elapsed += 0.25;
      setCurrentTime(Math.min(estDuration, elapsed));
    }, 250);

    utterance.onend = () => {
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      setIsPlaying(false);
      setCurrentTime(estDuration);
      interactionRef.current.completedListen = true;
      interactionRef.current.timeListenedMs += estDuration * 1000;
      notifyInteraction();
    };

    utterance.onerror = (e) => {
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      setIsPlaying(false);
      if (e.error !== "canceled" && e.error !== "interrupted") {
        setError("Speech playback was interrupted.");
      }
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
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
  };

  const handlePlay = () => {
    const remainingPlays = maxPlays - playCount;
    if (remainingPlays <= 0) return;

    setError(null);
    setCurrentTime(0);

    if (mode === "speech") {
      startSpeechSynthesis();
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      if (speechText) {
        setMode("speech");
        startSpeechSynthesis();
      }
      return;
    }

    audio.currentTime = 0;
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
        console.warn("[AudioPlayer] audio.play() failed, falling back to speech synthesis:", err);
        if (speechText) {
          setMode("speech");
          startSpeechSynthesis();
        } else {
          setError("Click play to listen.");
          setIsPlaying(false);
        }
      });
  };

  const handlePause = () => {
    if (mode === "speech") {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      setIsPlaying(false);
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const remainingPlays = Math.max(0, maxPlays - playCount);
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 space-y-3 shadow-sm">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="auto"
      />

      {/* Status & Replay Allowance Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/50 pb-2">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Volume2 className="size-4 text-primary" />
          <span>Audio Stimulus</span>
          {mode === "speech" && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              Voice Synthesis
            </span>
          )}
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
        </div>
      ) : null}

      {/* Playback Controls & Progress */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={disabled || isLoading || (remainingPlays <= 0 && !isPlaying)}
          onClick={isPlaying ? handlePause : handlePlay}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
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
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="absolute top-0 bottom-0 left-0 bg-primary transition-all duration-200"
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
