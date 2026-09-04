/**
 * Retry-Safe Audio Player Component with Natural Male & Female Voices
 * Supports HTML5 Audio playback with seamless fallback to Web Speech API (SpeechSynthesis)
 * when audio files are blocked, missing, or sound-effect placeholders.
 * Features multi-speaker voice alternation (Male & Female) and smooth progress bar resets.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, AlertCircle, Loader2 } from "lucide-react";
import type { AudioInteractionLog } from "@/lib/audio/audio-service";

export interface AudioPlayerProps {
  audioUrl?: string | undefined;
  speechText?: string | undefined;
  gender?: "female" | "male" | "auto" | undefined;
  maxPlays?: number | undefined; // e.g. 1 or 2 (TOEFL listening items limit replays)
  onInteractionChange?: ((log: AudioInteractionLog) => void) | undefined;
  disabled?: boolean | undefined;
  autoPlay?: boolean | undefined;
}

interface DialogueTurn {
  speaker: string;
  gender: "male" | "female";
  text: string;
}

export function AudioPlayer({
  audioUrl,
  speechText,
  gender = "auto",
  maxPlays = 2,
  onInteractionChange,
  disabled = false,
  autoPlay = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingRef = useRef(false);

  const [mode, setMode] = useState<"audio" | "speech">("audio");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playCount, setPlayCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

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

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Clean stop all audio and speech synthesis
  const stopAll = useCallback(() => {
    isPlayingRef.current = false;
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

  // Parse multi-speaker dialogue
  const parseDialogueTurns = useCallback(
    (text: string): DialogueTurn[] => {
      const lines = text
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);

      const turns: DialogueTurn[] = [];

      for (const line of lines) {
        const maleMatch = line.match(/^(Man|Male|Boy|Professor|Dr\.|Mr\.\s*\w+):\s*(.*)/i);
        const femaleMatch = line.match(/^(Woman|Female|Girl|Student|Ms\.\s*\w+|Mrs\.\s*\w+):\s*(.*)/i);

        if (maleMatch) {
          turns.push({
            speaker: maleMatch[1] || "Man",
            gender: "male",
            text: maleMatch[2] || line,
          });
        } else if (femaleMatch) {
          turns.push({
            speaker: femaleMatch[1] || "Woman",
            gender: "female",
            text: femaleMatch[2] || line,
          });
        } else {
          const chosenGender = gender === "male" ? "male" : "female";
          turns.push({ speaker: "Speaker", gender: chosenGender, text: line });
        }
      }

      return turns.length > 0
        ? turns
        : [{ speaker: "Speaker", gender: gender === "male" ? "male" : "female", text }];
    },
    [gender],
  );

  // Voice selector helper
  const getVoiceForGender = useCallback(
    (voiceGender: "male" | "female") => {
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
      const pool = englishVoices.length > 0 ? englishVoices : voices;

      if (voiceGender === "female") {
        const femaleNames = [
          "zira",
          "samantha",
          "victoria",
          "karen",
          "susan",
          "serena",
          "ava",
          "allison",
          "female",
          "natural",
          "cora",
          "jenny",
        ];
        const match = pool.find((v) => femaleNames.some((n) => v.name.toLowerCase().includes(n)));
        if (match) return match;

        const googleUS = pool.find(
          (v) => v.name.toLowerCase().includes("google") && !v.name.toLowerCase().includes("male"),
        );
        if (googleUS) return googleUS;
      } else {
        const maleNames = [
          "david",
          "guy",
          "alex",
          "daniel",
          "tom",
          "oliver",
          "george",
          "male",
          "microsoft david",
          "james",
          "ryan",
        ];
        const match = pool.find((v) => maleNames.some((n) => v.name.toLowerCase().includes(n)));
        if (match) return match;

        const googleUK = pool.find(
          (v) => v.name.toLowerCase().includes("google") && v.name.toLowerCase().includes("male"),
        );
        if (googleUK) return googleUK;
      }

      return pool[0] || null;
    },
    [voices],
  );

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

        const timeout = setTimeout(() => {
          if (speechText) {
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
    isPlayingRef.current = false;
    setCurrentTime(duration);
    interactionRef.current.completedListen = true;
    interactionRef.current.timeListenedMs += (duration || 0) * 1000;
    notifyInteraction();
  };

  const handleAudioError = () => {
    if (speechText) {
      setMode("speech");
      setDuration(estimateSpeechDuration(speechText));
      setIsLoading(false);
      setError(null);
    } else {
      setIsLoading(false);
      setError("Unable to play audio. Please check network connection.");
    }
  };

  // Multi-Turn Sequential Speech Synthesis Playback
  const startSpeechSynthesis = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !speechText) {
      setError("Speech synthesis is not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentTime(0);

    const turns = parseDialogueTurns(speechText);
    const estDuration = estimateSpeechDuration(speechText);
    setDuration(estDuration);

    let elapsed = 0;
    if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    speechTimerRef.current = setInterval(() => {
      if (!isPlayingRef.current) return;
      elapsed += 0.25;
      setCurrentTime(Math.min(estDuration, elapsed));
    }, 250);

    let currentTurnIndex = 0;

    const playNextTurn = () => {
      if (!isPlayingRef.current) return;

      if (currentTurnIndex >= turns.length) {
        if (speechTimerRef.current) clearInterval(speechTimerRef.current);
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentTime(estDuration);
        interactionRef.current.completedListen = true;
        interactionRef.current.timeListenedMs += estDuration * 1000;
        notifyInteraction();
        return;
      }

      const turn = turns[currentTurnIndex];
      if (!turn) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.rate = 0.93; // Natural pacing
      utterance.pitch = turn.gender === "female" ? 1.05 : 0.95;
      utterance.lang = "en-US";

      const selectedVoice = getVoiceForGender(turn.gender);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        currentTurnIndex += 1;
        setTimeout(playNextTurn, 350);
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          setError("Speech playback was interrupted.");
        }
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNextTurn();

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
        isPlayingRef.current = true;
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
      .catch(() => {
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
    stopAll();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const remainingPlays = Math.max(0, maxPlays - playCount);
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        preload="auto"
      />

      {/* Status & Replay Allowance Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Volume2 className="size-4 text-blue-600" />
          <span>Audio Stimulus</span>
          {mode === "speech" && (
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              Natural Voice
            </span>
          )}
        </div>
        <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-[11px] text-slate-700">
          Plays Remaining: <strong className="text-blue-600 font-bold">{remainingPlays}</strong> of {maxPlays}
        </span>
      </div>

      {/* Error state */}
      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
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
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:opacity-40"
          aria-label={isPlaying ? "Pause Audio" : "Play Audio"}
        >
          {isLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-5" />
          ) : (
            <Play className="size-5 ml-0.5 fill-current" />
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1 space-y-1.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="absolute top-0 bottom-0 left-0 bg-blue-600 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-500 font-semibold">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
