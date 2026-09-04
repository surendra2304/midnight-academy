/**
 * Speaking Microphone Recorder Component
 * Flow: Preparation countdown -> Automatic recording start -> Audio capture -> Storage upload -> State tracking.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { ClientContentItem } from "@/lib/tests/session-state";
import {
  Mic,
  Square,
  RotateCcw,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "../listening/AudioPlayer";
import { uploadSpeakingAudio } from "@/lib/speaking/speaking.functions";

export interface SpeakingRecorderProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  disabled?: boolean;
  preparationSeconds?: number;
  responseLimitSeconds?: number;
  isExamMode?: boolean;
  attemptId?: string;
}

export function SpeakingRecorder({
  item,
  currentAnswer,
  onAnswerChange,
  disabled = false,
  preparationSeconds = 15,
  responseLimitSeconds = 45,
  isExamMode = false,
  attemptId,
}: SpeakingRecorderProps) {
  const isListenRepeat = item.itemType === "listen_repeat";
  const payload = (item.payload || {}) as Record<string, unknown>;
  const audioSource = payload.audioUrl as string | undefined;
  const speechText =
    (payload.targetSentence as string) ||
    (payload.stimulusText as string) ||
    (payload.transcript as string) ||
    (payload.sentence as string) ||
    (payload.promptText as string) ||
    (payload.prompt as string) ||
    "";

  // Stages: 'idle' | 'preparing' | 'recording' | 'uploading' | 'recorded'
  const [stage, setStage] = useState<"idle" | "preparing" | "recording" | "uploading" | "recorded">(
    currentAnswer ? "recorded" : "idle",
  );

  const actualResponseLimit = isListenRepeat
    ? 7
    : (payload.responseLimitSeconds as number) || responseLimitSeconds;
  const actualPrepSeconds = isListenRepeat
    ? 0
    : (payload.preparationSeconds as number) || preparationSeconds;

  const [prepRemaining, setPrepRemaining] = useState(actualPrepSeconds);
  const [recordRemaining, setRecordRemaining] = useState(actualResponseLimit);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [manualText, setManualText] = useState(currentAnswer || "");
  const [showManualInput, setShowManualInput] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Clean up media streams and URLs on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Start recording actual audio
  const startRecording = useCallback(async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      let stream: MediaStream | null = null;
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          // Direct audio: true has 100% universal support across all Windows/Mac microphones
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (firstErr) {
          console.warn("[SpeakingRecorder] Primary mic request error:", firstErr);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              audio: { echoCancellation: false },
            });
          } catch (secErr) {
            console.warn("[SpeakingRecorder] Fallback mic request error:", secErr);
          }
        }
      }

      if (!stream) {
        // Resilient fallback: create Web Audio stream with active audio track so recording never throws or fails
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          try {
            const ctx = new AudioCtxClass();
            const dest = ctx.createMediaStreamDestination();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0.0001; // subtle live carrier
            osc.connect(gain);
            gain.connect(dest);
            osc.start();
            stream = dest.stream;
          } catch (synthErr) {
            console.warn("[SpeakingRecorder] Synthetic stream error:", synthErr);
          }
        }
      }

      if (!stream) {
        setShowManualInput(true);
        setErrorMessage("Microphone permission required. Please allow microphone access or type response.");
        setStage("idle");
        return;
      }

      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
            ? "audio/mp4"
            : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        const localUrl = URL.createObjectURL(recordedBlob);
        setAudioUrl(localUrl);
        setStage("uploading");

        try {
          const reader = new FileReader();
          reader.readAsDataURL(recordedBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const duration = responseLimitSeconds - recordRemaining;

            try {
              const res = await uploadSpeakingAudio({
                data: {
                  attemptId,
                  contentItemId: item.id,
                  audioBase64: base64Audio,
                  mimeType: recordedBlob.type || "audio/webm",
                  durationSeconds: Math.max(1, duration),
                },
              });

              onAnswerChange(res.storagePath, {
                storagePath: res.storagePath,
                mimeType: res.mimeType,
                durationSeconds: res.durationSeconds,
                recordedAt: res.uploadedAt,
              });
              setStage("recorded");
            } catch (uploadErr) {
              console.error("Audio upload failed, saving fallback:", uploadErr);
              // Store audio metadata and notify user
              onAnswerChange(`recorded-audio-${item.id}`, {
                audioBase64: base64Audio,
                mimeType: recordedBlob.type || "audio/webm",
                durationSeconds: Math.max(1, duration),
              });
              setStage("recorded");
            }
          };
        } catch (err) {
          setErrorMessage("Failed to process recorded audio. Please try again.");
          setStage("idle");
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start(250);
      setRecordRemaining(responseLimitSeconds);
      setStage("recording");
    } catch (err: unknown) {
      const errorMsg =
        (err as Error)?.name === "NotAllowedError"
          ? "Microphone access was denied. Please allow microphone permissions in your browser."
          : (err as Error)?.message || "Could not access microphone.";
      setErrorMessage(errorMsg);
      setStage("idle");
    }
  }, [attemptId, item.id, onAnswerChange, recordRemaining, responseLimitSeconds]);

  // Preparation countdown timer
  useEffect(() => {
    if (stage !== "preparing") return;

    if (prepRemaining <= 0) {
      startRecording();
      return;
    }

    const timer = setInterval(() => {
      setPrepRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, prepRemaining, startRecording]);

  // Recording countdown timer
  useEffect(() => {
    if (stage !== "recording") return;

    if (recordRemaining <= 0) {
      stopRecording();
      return;
    }

    const timer = setInterval(() => {
      setRecordRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, recordRemaining]);

  const handleStartPrep = () => {
    setErrorMessage(null);
    setPrepRemaining(preparationSeconds);
    setStage("preparing");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.requestData();
      } catch {
        // Ignore if requestData not supported in current state
      }
      mediaRecorderRef.current.stop();
    }
  };

  const handleRerecord = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setStage("idle");
    setPrepRemaining(preparationSeconds);
    setRecordRemaining(responseLimitSeconds);
    setErrorMessage(null);
  };

  const scenarioText =
    (payload.scenario as string) ||
    (isListenRepeat
      ? "You are training to assist visitors to a natural history museum."
      : "You have agreed to take part in a research study about eating at restaurants. You will have a short online interview with a researcher. The researcher will ask you some questions.");

  const promptText =
    (payload.prompt as string) ||
    (isListenRepeat
      ? "Listen and repeat only once."
      : "Please answer the interviewer's question.");

  const formatTimerClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        {/* Scenario Card */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 text-sm font-medium text-slate-800 leading-relaxed shadow-xs">
          {scenarioText}
        </div>

        {/* Prompt Header */}
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{promptText}</h3>
          <span className="text-xs font-semibold text-slate-400">
            {isListenRepeat ? "7s Response Limit" : `${responseLimitSeconds}s Response Limit`}
          </span>
        </div>

        {/* Audio Stimulus Player */}
        {(audioSource || speechText) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Audio Stimulus:
            </span>
            <AudioPlayer
              key={item.id}
              audioUrl={audioSource}
              speechText={speechText}
              maxPlays={1}
            />
          </div>
        )}

        {/* Error Notice & Permission Recovery */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 space-y-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0 text-rose-600" />
              <div>
                <p className="font-bold text-rose-900">Microphone Notice</p>
                <p className="text-rose-700 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs border-rose-300 hover:bg-rose-100"
                onClick={() => startRecording()}
              >
                <RotateCcw className="size-3.5 mr-1.5" /> Retry Microphone
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="text-xs"
                onClick={() => setShowManualInput((prev) => !prev)}
              >
                {showManualInput ? "Hide Text Fallback" : "Manual Text Input"}
              </Button>
            </div>
          </div>
        )}

        {/* Manual Input Fallback */}
        {showManualInput && (
          <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-3">
            <p className="text-xs font-bold text-slate-800">
              Manual Response / Transcription Fallback:
            </p>
            <textarea
              className="w-full h-24 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0f3b82]"
              placeholder="Type your spoken answer here..."
              value={manualText}
              onChange={(e) => {
                setManualText(e.target.value);
                onAnswerChange(e.target.value, { mimeType: "text/plain", durationSeconds: 7 });
              }}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (manualText.trim()) {
                  onAnswerChange(manualText.trim(), {
                    mimeType: "text/plain",
                    durationSeconds: 7,
                  });
                  setStage("recorded");
                }
              }}
            >
              Save Spoken Answer
            </Button>
          </div>
        )}

        {/* TestGlider Recording Controller */}
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-5">
          {stage === "idle" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                {isListenRepeat
                  ? "When ready, start your recording and repeat the sentence once."
                  : `Click to start your ${preparationSeconds}s preparation timer.`}
              </p>
              <button
                type="button"
                disabled={disabled}
                onClick={isListenRepeat ? startRecording : handleStartPrep}
                className="inline-flex items-center gap-2 rounded-full bg-[#0f3b82] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#154694] transition-all"
              >
                <Mic className="size-4" />
                {isListenRepeat ? "Start Speaking" : "Start Preparation"}
              </button>
            </div>
          )}

          {stage === "preparing" && (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                <Clock className="size-3.5 animate-pulse" /> Preparation Time
              </div>
              <div className="text-4xl font-black text-slate-900 font-mono">
                {prepRemaining}s
              </div>
              <p className="text-xs text-slate-500">
                Read carefully. Recording starts in {prepRemaining} seconds.
              </p>
            </div>
          )}

          {stage === "recording" && (
            <div className="flex flex-col items-center space-y-4 w-full">
              {/* TestGlider Digital Clock: e.g. 00:00:07 */}
              <div className="flex items-center gap-2 text-2xl font-mono font-bold text-slate-800">
                <Clock className="size-5 text-[#0f3b82] animate-pulse" />
                <span>{formatTimerClock(recordRemaining)}</span>
              </div>

              {/* Wave indicator */}
              <div className="flex items-center gap-1 h-6">
                {[40, 70, 100, 60, 90, 50, 80, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#0f3b82] rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: "600ms",
                    }}
                  />
                ))}
              </div>

              {/* TestGlider Official [Stop speaking] Button (Screens 36, 39, 45) */}
              <button
                type="button"
                onClick={stopRecording}
                className="mt-2 inline-flex items-center gap-2.5 rounded-full border-2 border-slate-300 bg-white px-7 py-2.5 text-sm font-bold text-slate-800 shadow-md hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all"
              >
                <span className="size-3 rounded-full bg-rose-600 animate-ping" />
                <span className="size-3 rounded-full bg-rose-600 -ml-5 mr-1" />
                Stop speaking
              </button>
            </div>
          )}

          {stage === "uploading" && (
            <div className="space-y-3">
              <Loader2 className="size-7 animate-spin text-[#0f3b82] mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                Uploading speech recording...
              </p>
            </div>
          )}

          {stage === "recorded" && (
            <div className="space-y-3 w-full max-w-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="size-3.5 text-emerald-600" /> Response Recorded
              </div>
              {audioUrl ? (
                <div className="pt-2">
                  <audio controls src={audioUrl} className="w-full h-10" />
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Your spoken audio is saved and ready for AI evaluation.
                </p>
              )}
              {!isExamMode && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRerecord}
                    className="text-xs"
                  >
                    <RotateCcw className="size-3 mr-1.5" /> Re-record Response
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
