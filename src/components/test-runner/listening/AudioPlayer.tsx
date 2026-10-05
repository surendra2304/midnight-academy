/**
 * Retry-Safe Audio Player Component with Natural Male & Female Voices
 * Supports HTML5 Audio playback with seamless fallback to Web Speech API (SpeechSynthesis)
 * when audio files are blocked, missing, or sound-effect placeholders.
 * Features multi-speaker voice alternation (Male & Female) and smooth progress bar resets.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, RotateCcw } from "lucide-react";
import type { AudioInteractionLog } from "@/lib/audio/audio-service";

export interface AudioPlayerProps {
  audioUrl?: string | undefined;
  speechText?: string | undefined;
  gender?: "female" | "male" | "auto" | undefined;
  maxPlays?: number | undefined;
  onInteractionChange?: ((log: AudioInteractionLog) => void) | undefined;
  onEnded?: (() => void) | undefined;
  disabled?: boolean | undefined;
  autoPlay?: boolean | undefined;
  allowControls?: boolean | undefined;
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
  onEnded,
  disabled = false,
  autoPlay = true,
  allowControls = true,
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

  // Parse multi-speaker dialogue and strip speaker tags so "Speaker 1:" / "Man:" is never spoken aloud
  const parseDialogueTurns = useCallback(
    (text: string): DialogueTurn[] => {
      const lines = text
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);

      const turns: DialogueTurn[] = [];
      const speakerGenderMap = new Map<string, "male" | "female">();
      let nextFallbackGender: "male" | "female" = gender === "male" ? "male" : "female";

      for (const line of lines) {
        const genericLabelMatch = line.match(/^([A-Za-z][A-Za-z0-9\s.]{0,24}):\s*(.+)$/);

        if (genericLabelMatch) {
          const rawSpeaker = genericLabelMatch[1]!.trim();
          const spokenContent = genericLabelMatch[2]!.trim();
          const lowerSpeaker = rawSpeaker.toLowerCase();

          let resolvedGender: "male" | "female";
          if (speakerGenderMap.has(lowerSpeaker)) {
            resolvedGender = speakerGenderMap.get(lowerSpeaker)!;
          } else if (
            /\b(man|male|boy|mr\.|dr\.|father|brother|husband|son|speaker 1)\b/i.test(lowerSpeaker)
          ) {
            resolvedGender = "male";
            speakerGenderMap.set(lowerSpeaker, resolvedGender);
            nextFallbackGender = "female";
          } else if (
            /\b(woman|female|girl|ms\.|mrs\.|mother|sister|wife|daughter|speaker 2)\b/i.test(
              lowerSpeaker,
            )
          ) {
            resolvedGender = "female";
            speakerGenderMap.set(lowerSpeaker, resolvedGender);
            nextFallbackGender = "male";
          } else {
            resolvedGender = nextFallbackGender;
            speakerGenderMap.set(lowerSpeaker, resolvedGender);
            nextFallbackGender = resolvedGender === "male" ? "female" : "male";
          }

          turns.push({
            speaker: rawSpeaker,
            gender: resolvedGender,
            text: spokenContent,
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    hasAutoPlayedRef.current = false;
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
    if (onEnded) onEnded();
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
    const estDuration = estimateSpeechDuration(speechText || "");
    setDuration(estDuration);

    if (typeof window === "undefined" || !("speechSynthesis" in window) || !speechText) {
      // Simulate timer progression if browser lacks speechSynthesis
      isPlayingRef.current = true;
      setIsPlaying(true);
      setCurrentTime(0);
      let elapsed = 0;
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      speechTimerRef.current = setInterval(() => {
        elapsed += 0.5;
        if (elapsed >= estDuration) {
          if (speechTimerRef.current) clearInterval(speechTimerRef.current);
          setIsPlaying(false);
          isPlayingRef.current = false;
          setCurrentTime(estDuration);
          if (onEnded) onEnded();
        } else {
          setCurrentTime(elapsed);
        }
      }, 500);
      return;
    }

    window.speechSynthesis.cancel();
    isPlayingRef.current = true;
    setIsPlaying(true);
    setCurrentTime(0);

    const turns = parseDialogueTurns(speechText);

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
        if (onEnded) onEnded();
        return;
      }

      const turn = turns[currentTurnIndex];
      if (!turn) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.rate = 0.95;
      utterance.pitch = turn.gender === "female" ? 1.05 : 0.95;
      utterance.lang = "en-US";

      const selectedVoice = getVoiceForGender(turn.gender);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        currentTurnIndex += 1;
        setTimeout(playNextTurn, 300);
      };

      utterance.onerror = (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted") {
          setError(null);
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
          setError("Click Play to listen.");
          setIsPlaying(false);
        }
      });
  };

  // Automatic single playback after a short settling delay (550ms)
  const hasAutoPlayedRef = useRef(false);
  const handlePlayRef = useRef(handlePlay);
  handlePlayRef.current = handlePlay;
  useEffect(() => {
    if (disabled || !autoPlay || hasAutoPlayedRef.current) return;

    const timer = setTimeout(() => {
      if (!hasAutoPlayedRef.current && !isPlayingRef.current && playCount === 0) {
        hasAutoPlayedRef.current = true;
        handlePlayRef.current();
      }
    }, 550);

    return () => clearTimeout(timer);
  }, [disabled, autoPlay, playCount]);

  const handlePause = () => {
    stopAll();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        onPlay={() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          if (playCount === 0) {
            interactionRef.current.firstPlayedAt = new Date().toISOString();
          }
          interactionRef.current.playCount = Math.max(1, interactionRef.current.playCount);
          interactionRef.current.lastPlayedAt = new Date().toISOString();
        }}
        preload="auto"
        className="hidden"
      />

      {allowControls && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white/90 px-3.5 py-2.5 shadow-xs">
          <button
            type="button"
            disabled={disabled || isLoading}
            onClick={isPlaying ? handlePause : handlePlay}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0f3b82] text-white hover:bg-[#154694] transition-colors cursor-pointer disabled:opacity-40"
            title={isPlaying ? "Stop Audio" : playCount > 0 ? "Replay Audio" : "Play Audio"}
          >
            {isPlaying ? (
              <Pause className="size-3.5" />
            ) : playCount > 0 ? (
              <RotateCcw className="size-3.5" />
            ) : (
              <Play className="size-3.5 ml-0.5" />
            )}
          </button>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Volume2
                  className={`size-3.5 text-[#0f3b82] ${isPlaying ? "animate-pulse" : ""}`}
                />
                {isPlaying
                  ? "Playing audio..."
                  : playCount > 0
                    ? "Audio completed (Click to replay)"
                    : "Click Play to listen"}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-[#0f3b82] transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
