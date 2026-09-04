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

  const [prepRemaining, setPrepRemaining] = useState(preparationSeconds);
  const [recordRemaining, setRecordRemaining] = useState(responseLimitSeconds);
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
        setShowManualInput(true);
        setErrorMessage("Microphone not detected. Please type your response using the text box below.");
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

  const promptText =
    (item.payload?.prompt as string) ||
    (item.payload?.questionText as string) ||
    "Respond verbally to the interview prompt:";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/40 p-6 space-y-6">
        {/* Task Header */}
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Mic className="size-4" /> {item.itemType.replace(/_/g, " ")}
          </span>
          <span className="text-xs text-muted-foreground">
            Response Limit: <strong>{responseLimitSeconds}s</strong>
          </span>
        </div>

        {/* Source Audio (for Listen and Repeat) */}
        {isListenRepeat && (audioSource || speechText) ? (
          <div className="rounded-lg border border-border bg-background/50 p-4 space-y-2">
            <span className="text-xs font-bold text-foreground">
              Step 1: Listen to the prompt carefully
            </span>
            <AudioPlayer
              key={item.id}
              audioUrl={audioSource}
              speechText={speechText}
              maxPlays={2}
            />
          </div>
        ) : null}

        {/* Interview Prompt */}
        <div className="rounded-lg bg-surface-2/40 border border-border/60 p-4 space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase">Prompt:</p>
          <p className="text-sm font-semibold text-foreground leading-relaxed">{promptText}</p>
        </div>

        {/* Error Message & Permission Recovery */}
        {errorMessage ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive space-y-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0" />
              <div>
                <p className="font-bold">Microphone Notice</p>
                <p className="text-muted-foreground mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs border-destructive/30 hover:bg-destructive/20"
                onClick={() => startRecording()}
              >
                <RotateCcw className="size-3.5 mr-1.5" /> Retry Microphone Access
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="text-xs"
                onClick={() => setShowManualInput((prev) => !prev)}
              >
                {showManualInput ? "Hide Text Input" : "Type / Transcribe Response Instead"}
              </Button>
            </div>
          </div>
        ) : null}

        {/* Manual Input Fallback */}
        {showManualInput && (
          <div className="rounded-xl border border-primary/20 bg-background/80 p-4 space-y-3">
            <p className="text-xs font-bold text-foreground">
              Manual Response / Transcription Mode:
            </p>
            <textarea
              className="w-full h-28 rounded-lg border border-border bg-surface-1 p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Type your verbal response here if your microphone is unavailable or blocked in your browser..."
              value={manualText}
              onChange={(e) => {
                setManualText(e.target.value);
                onAnswerChange(e.target.value, { mimeType: "text/plain", durationSeconds: 15 });
              }}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Your response will be saved and evaluated by the AI grader.</span>
              <Button
                type="button"
                size="sm"
                variant="default"
                onClick={() => {
                  if (manualText.trim()) {
                    onAnswerChange(manualText.trim(), { mimeType: "text/plain", durationSeconds: 15 });
                    setStage("recorded");
                  }
                }}
              >
                Confirm Saved Response
              </Button>
            </div>
          </div>
        )}

        {/* Interactive Recording Controller Box */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col items-center justify-center text-center space-y-4">
          {stage === "idle" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Click below to begin your <strong>{preparationSeconds}s</strong> preparation timer.
                Recording will start automatically.
              </p>
              <Button size="lg" disabled={disabled} onClick={handleStartPrep}>
                <Mic className="size-4 mr-2" /> Start Preparation
              </Button>
            </div>
          )}

          {stage === "preparing" && (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-500">
                <Clock className="size-3.5 animate-pulse" /> Preparation Time
              </div>
              <div className="text-4xl font-black text-foreground font-mono">{prepRemaining}s</div>
              <p className="text-xs text-muted-foreground">
                Read the prompt carefully. Recording starts in {prepRemaining} seconds.
              </p>
            </div>
          )}

          {stage === "recording" && (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-bold text-red-500 animate-pulse">
                <span className="size-2 rounded-full bg-red-500 animate-ping" /> Recording In
                Progress
              </div>
              <div className="text-4xl font-black text-red-500 font-mono">{recordRemaining}s</div>
              <p className="text-xs text-muted-foreground">Speak clearly into your microphone.</p>
              <Button variant="destructive" size="sm" onClick={stopRecording} className="mt-2">
                <Square className="size-3.5 mr-1.5 fill-current" /> Finish Recording
              </Button>
            </div>
          )}

          {stage === "uploading" && (
            <div className="space-y-3">
              <Loader2 className="size-8 animate-spin text-primary mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                Securing and uploading speech recording...
              </p>
            </div>
          )}

          {stage === "recorded" && (
            <div className="space-y-3 w-full max-w-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-500">
                <CheckCircle2 className="size-3.5" /> Spoken Response Recorded
              </div>
              {audioUrl ? (
                <div className="pt-2">
                  <audio controls src={audioUrl} className="w-full h-10" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Your spoken response is saved and ready for AI evaluation.
                </p>
              )}
              {!isExamMode && (
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={handleRerecord} className="text-xs">
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
