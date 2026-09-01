/**
 * Speaking Microphone Recorder Component
 * Flow: Preparation countdown -> Recording with live audio wave & timer -> Stop/Re-record -> Base64/Upload packing.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ClientContentItem } from '@/lib/tests/session-state';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, UploadCloud, AlertCircle, CheckCircle2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from '../listening/AudioPlayer';

export interface SpeakingRecorderProps {
  item: ClientContentItem;
  currentAnswer: string | null;
  onAnswerChange: (rawAnswer: string, normalizedAnswer?: Record<string, unknown>) => void;
  disabled?: boolean;
  preparationSeconds?: number;
  responseLimitSeconds?: number;
}

export function SpeakingRecorder({
  item,
  currentAnswer,
  onAnswerChange,
  disabled = false,
  preparationSeconds = 15,
  responseLimitSeconds = 45,
}: SpeakingRecorderProps) {
  const isListenRepeat = item.itemType === 'listen_repeat';
  const audioSource = item.payload?.audioUrl as string;

  // Stages: 'idle' | 'preparing' | 'recording' | 'recorded' | 'uploading' | 'ready'
  const [stage, setStage] = useState<'idle' | 'preparing' | 'recording' | 'recorded'>('idle');
  const [prepRemaining, setPrepRemaining] = useState(preparationSeconds);
  const [recordRemaining, setRecordRemaining] = useState(responseLimitSeconds);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. Check microphone permission on mount
  useEffect(() => {
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        setHasMicPermission(true);
        // Release immediate test stream
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        setHasMicPermission(false);
      });
  }, []);

  // 2. Preparation timer countdown
  useEffect(() => {
    if (stage !== 'preparing') return;

    if (prepRemaining <= 0) {
      startRecording();
      return;
    }

    const timer = setInterval(() => {
      setPrepRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, prepRemaining]);

  // 3. Recording countdown timer
  useEffect(() => {
    if (stage !== 'recording') return;

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
    setPrepRemaining(preparationSeconds);
    setStage('preparing');
  };

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Convert to base64 for submission
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onAnswerChange(base64Audio, {
            mimeType: 'audio/webm',
            durationSeconds: responseLimitSeconds - recordRemaining,
          });
        };

        // Stop all microphone tracks
        stream.getTracks().forEach((track) => track.stop());
        setStage('recorded');
      };

      recorder.start();
      setRecordRemaining(responseLimitSeconds);
      setStage('recording');
    } catch (err) {
      setErrorMessage('Could not access microphone. Please grant permission in your browser.');
      setStage('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRerecord = () => {
    setAudioUrl(null);
    setStage('idle');
    setPrepRemaining(preparationSeconds);
    setRecordRemaining(responseLimitSeconds);
  };

  const promptText = (item.payload?.prompt as string) || (item.payload?.questionText as string) || 'Respond verbally to the interview prompt:';

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/40 p-6 space-y-6">
        {/* Task Header */}
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Mic className="size-4" /> {item.itemType.replace(/_/g, ' ')}
          </span>
          <span className="text-xs text-muted-foreground">
            Response Time: <strong>{responseLimitSeconds}s</strong>
          </span>
        </div>

        {/* Source Audio (for Listen and Repeat) */}
        {isListenRepeat && audioSource ? (
          <div className="rounded-lg border border-border bg-background/50 p-4 space-y-2">
            <span className="text-xs font-bold text-foreground">Step 1: Listen to the prompt carefully</span>
            <AudioPlayer audioUrl={audioSource} maxPlays={2} />
          </div>
        ) : null}

        {/* Interview Prompt */}
        <div className="rounded-lg bg-surface-2/40 border border-border/60 p-4 space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase">Prompt:</p>
          <p className="text-sm font-semibold text-foreground leading-relaxed">{promptText}</p>
        </div>

        {/* Permission Denied UI */}
        {hasMicPermission === false ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <div>
              <p className="font-bold">Microphone access is blocked</p>
              <p className="text-muted-foreground mt-0.5">Please allow microphone access in your browser settings to record your response.</p>
            </div>
          </div>
        ) : null}

        {/* Recording Controller Box */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col items-center justify-center text-center space-y-4">
          {stage === 'idle' ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Click below to begin your <strong>{preparationSeconds}s</strong> preparation time.
              </p>
              <Button size="lg" disabled={disabled || hasMicPermission === false} onClick={handleStartPrep}>
                <Mic className="size-4 mr-2" /> Start Preparation
              </Button>
            </div>
          ) : null}

          {stage === 'preparing' ? (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preparation Time Remaining:</span>
              <p className="text-4xl font-black text-primary font-mono">{prepRemaining}s</p>
              <Button size="sm" variant="outline" onClick={startRecording}>
                Skip Prep & Record Now
              </Button>
            </div>
          ) : null}

          {stage === 'recording' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-destructive font-bold text-xs uppercase tracking-widest animate-pulse">
                <span className="size-3 rounded-full bg-destructive" /> Live Recording
              </div>
              <p className="text-4xl font-black text-foreground font-mono">{recordRemaining}s</p>
              <Button size="lg" variant="destructive" onClick={stopRecording}>
                <Square className="size-4 mr-2 fill-current" /> Stop Recording
              </Button>
            </div>
          ) : null}

          {stage === 'recorded' ? (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center gap-2 text-success font-bold text-xs">
                <CheckCircle2 className="size-4" /> Recording Complete
              </div>

              {audioUrl ? (
                <div className="max-w-md mx-auto">
                  <AudioPlayer audioUrl={audioUrl} maxPlays={99} />
                </div>
              ) : null}

              <div className="flex items-center justify-center gap-3">
                <Button size="sm" variant="outline" onClick={handleRerecord} disabled={disabled}>
                  <RotateCcw className="size-3.5 mr-1" /> Re-record
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
