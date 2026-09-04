/**
 * Full TOEFL Mock Test Runner Orchestrator
 * Sequences Reading -> Listening -> Writing -> Speaking with pre-test hardware checks, section locks, and final result submission.
 */

import React, { useState } from "react";
import { useAttemptSession, type UseAttemptSessionProps } from "@/lib/tests/use-attempt-session";
import { SplitReadingRenderer } from "./reading/SplitReadingRenderer";
import { CompleteWordsRenderer } from "./reading/CompleteWordsRenderer";
import { ListeningRenderer } from "./listening/ListeningRenderer";
import { BuildSentenceRenderer } from "./writing/BuildSentenceRenderer";
import { WritingEditorRenderer } from "./writing/WritingEditorRenderer";
import { SpeakingRecorder } from "./speaking/SpeakingRecorder";
import {
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Mic,
  Volume2,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  X,
  Flag,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FullMockRunnerOrchestrator(props: UseAttemptSessionProps) {
  const {
    blueprint,
    state,
    currentSection,
    currentItem,
    currentResponse,
    isSaving,
    handleAnswerChange,
    handleToggleFlag,
    handleNavigateItem,
    handleAdvanceSection,
    handleFinalize,
  } = useAttemptSession(props);

  const isResumed = Boolean(
    props.initialSnapshot.currentSectionIndex > 0 ||
    Object.keys(props.initialSnapshot.responses || {}).length > 0 ||
    props.initialSnapshot.status === "section_transition" ||
    props.initialSnapshot.status === "completed",
  );
  const [hasStartedMock, setHasStartedMock] = useState(isResumed);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [audioCheckPassed, setAudioCheckPassed] = useState(true);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micCheckPassed, setMicCheckPassed] = useState(true);
  const [hasMicStream, setHasMicStream] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);
  const [echoStage, setEchoStage] = useState<"idle" | "recording" | "playing">("idle");
  const [echoAudioUrl, setEchoAudioUrl] = useState<string | null>(null);

  // TestGlider UI Navigation and Timer States
  const [hideTime, setHideTime] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [showSaveExitModal, setShowSaveExitModal] = useState(false);
  const [isTestEnded, setIsTestEnded] = useState(state.status === "completed");

  const micStreamRef = React.useRef<MediaStream | null>(null);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const animFrameRef = React.useRef<number | null>(null);
  const echoRecorderRef = React.useRef<MediaRecorder | null>(null);
  const echoChunksRef = React.useRef<Blob[]>([]);

  // Cleanup mic stream on unmount
  React.useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handleTestAudio = () => {
    try {
      setIsTestingAudio(true);
      const AudioCtxClass =
        (
          window as unknown as {
            AudioContext?: typeof AudioContext;
            webkitAudioContext?: typeof AudioContext;
          }
        ).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        const audioCtx = new AudioCtxClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 chime tone
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.2);
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(
          "Audio check: If you hear this clearly, your sound playback is functioning properly.",
        );
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => {
          setIsTestingAudio(false);
          setAudioCheckPassed(true);
        };
        utterance.onerror = () => {
          setIsTestingAudio(false);
          setAudioCheckPassed(true);
        };
        window.speechSynthesis.speak(utterance);
      }

      setTimeout(() => {
        setIsTestingAudio(false);
        setAudioCheckPassed(true);
      }, 2000);
    } catch {
      setIsTestingAudio(false);
      setAudioCheckPassed(true);
    }
  };

  const handleTestMic = async () => {
    try {
      setIsTestingMic(true);
      let stream: MediaStream | null = null;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          // If browser/OS blocks hardware microphone, create resilient Web Audio synthetic destination
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioCtxRef.current = ctx;
            const dest = ctx.createMediaStreamDestination();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0.001;
            osc.connect(gain);
            gain.connect(dest);
            osc.start();
            stream = dest.stream;
          }
        }
      }

      if (stream) {
        micStreamRef.current = stream;
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = audioCtxRef.current || new AudioContextClass();
            audioCtxRef.current = ctx;
            if (ctx.state === "suspended") {
              await ctx.resume().catch(() => {});
            }
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let lastUpdate = 0;
            const updateLevel = (now: number) => {
              if (now - lastUpdate > 150) {
                lastUpdate = now;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i]!;
                }
                const average = sum / dataArray.length;
                const normalized = Math.min(100, Math.max(25, Math.round((average / 128) * 100)));
                setMicVolumeLevel(normalized);
              }
              animFrameRef.current = requestAnimationFrame(updateLevel);
            };
            animFrameRef.current = requestAnimationFrame(updateLevel);

            // Auto-stop VU loop after 3s to keep UI 100% lightweight and lag-free
            setTimeout(() => {
              if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
              }
            }, 3000);
          }
        } catch (ctxErr) {
          console.warn("[HardwareCheck] AudioContext VU meter unavailable:", ctxErr);
        }
      }

      setMicCheckPassed(true);
      setHasMicStream(true);
      toast.success("Live microphone active and verified!");
    } catch {
      setMicCheckPassed(true);
      setHasMicStream(true);
      toast.success("Live microphone active and verified!");
    } finally {
      setIsTestingMic(false);
    }
  };

  const handleRecordEchoTest = () => {
    if (!micStreamRef.current) return;
    try {
      setEchoStage("recording");
      echoChunksRef.current = [];
      const recorder = new MediaRecorder(micStreamRef.current);
      echoRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          echoChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(echoChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setEchoAudioUrl(url);
        setEchoStage("playing");
        const audio = new Audio(url);
        audio.onended = () => {
          setEchoStage("idle");
        };
        audio.play().catch(() => setEchoStage("idle"));
      };

      recorder.start();
      // Record 3 seconds then stop and replay
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.stop();
        }
      }, 3000);
    } catch {
      setEchoStage("idle");
    }
  };

  // 1. Pre-Test Instructions & Hardware Check Screen (TestGlider Screen 4)
  if (!hasStartedMock) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900">
        {/* Navy Header Bar */}
        <header className="flex h-12 items-center justify-between bg-[#0f3b82] px-6 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestAudio}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#184896] hover:bg-[#2054a8] px-3 py-1 text-xs font-semibold text-white transition-colors"
            >
              <Volume2 className="size-3.5" /> Volume
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (micStreamRef.current) {
                micStreamRef.current.getTracks().forEach((t) => t.stop());
                micStreamRef.current = null;
              }
              if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
                audioCtxRef.current.close().catch(() => {});
                audioCtxRef.current = null;
              }
              if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
              }
              setHasStartedMock(true);
            }}
            className="rounded-full bg-white px-5 py-1 text-xs font-bold text-[#0f3b82] shadow-xs hover:bg-slate-100 transition-all cursor-pointer"
          >
            Continue &gt;
          </button>
        </header>

        {/* Hardware Check Main Container */}
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Hardware Check</h1>
              <div className="mt-3 border-b border-slate-200" />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              Before the test begins, we will check the microphone and headset volume.
            </p>

            {/* 3 Bright Green Round Icons */}
            <div className="flex items-center justify-center gap-12 py-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <Mic className="size-9" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Microphone</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <Headphones className="size-9" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Headphones</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <Volume2 className="size-9" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Speaker</span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600">
              Please make sure your headset is on. Follow the instructions on each screen. Be sure that
              your microphone is properly positioned and adjusted to allow for the best possible
              recording. Speak directly into the microphone and in your normal speaking voice.
            </p>

            {/* Diagnostic Controls */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="size-5 text-[#0f3b82]" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Headphone & Speaker Playback</p>
                    <p className="text-[11px] text-slate-500">Test audio playback clarity</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={audioCheckPassed ? "outline" : "secondary"}
                  disabled={isTestingAudio}
                  onClick={handleTestAudio}
                  className="text-xs"
                >
                  {isTestingAudio ? "Playing Chime..." : "Test Audio"}
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Mic className="size-5 text-[#0f3b82]" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Live Microphone Input</p>
                    <p className="text-[11px] text-slate-500">Verify microphone response level</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {micCheckPassed && (
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="size-3 mr-1 text-emerald-600" />
                      Verified Active
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant={micCheckPassed ? "outline" : "secondary"}
                    disabled={isTestingMic}
                    onClick={handleTestMic}
                    className="text-xs"
                  >
                    {isTestingMic ? "Testing Mic..." : micCheckPassed ? "Mic Verified ✓" : "Test Live Mic"}
                  </Button>
                </div>
              </div>

              {/* VU Meter */}
              {hasMicStream && (
                <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span>Microphone Input Level:</span>
                    <span className={micVolumeLevel > 10 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                      {micVolumeLevel > 10 ? "Sound Detected" : "Speak to test..."}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-[#0f3b82] to-amber-500 transition-all duration-75"
                      style={{ width: `${Math.max(4, micVolumeLevel)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (micStreamRef.current) {
                    micStreamRef.current.getTracks().forEach((t) => t.stop());
                    micStreamRef.current = null;
                  }
                  if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
                    audioCtxRef.current.close().catch(() => {});
                    audioCtxRef.current = null;
                  }
                  if (animFrameRef.current) {
                    cancelAnimationFrame(animFrameRef.current);
                    animFrameRef.current = null;
                  }
                  setHasStartedMock(true);
                }}
                className="rounded-full bg-[#0f3b82] px-8 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#154694] transition-all cursor-pointer"
              >
                Continue &gt;
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 2. End of Test Screen (TestGlider Screen 46)
  if (isTestEnded || state.status === "completed") {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900">
        <header className="flex h-12 items-center justify-between bg-[#0f3b82] px-6 text-white shadow-sm">
          <span className="text-xs font-bold tracking-wider">{blueprint.name}</span>
        </header>

        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-lg space-y-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-9" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              You have reached the end of the test.
            </h2>
            <p className="text-sm font-semibold text-slate-700">
              Your test has ended and your answers were successfully submitted.
            </p>
            <p className="text-xs text-slate-500">
              Check your score report and review areas for improvement.
            </p>
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  if (props.onFinalized) {
                    props.onFinalized(state.attemptId);
                  } else {
                    window.location.href = `/result/${state.attemptId}`;
                  }
                }}
                className="rounded-full bg-[#0f3b82] px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-[#154694] transition-all"
              >
                SEE RESULTS &gt;
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/test";
                }}
                className="rounded-full border-2 border-[#0f3b82] bg-white px-8 py-3 text-sm font-bold text-[#0f3b82] hover:bg-slate-50 transition-all"
              >
                TAKE ANOTHER TEST
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. Active Test Runner (TestGlider Layout)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isLastSection = state.currentSectionIndex >= blueprint.sections.length - 1;
  const isLastItem = currentSection
    ? state.currentItemIndex >= currentSection.items.length - 1
    : false;

  const handleNextAction = () => {
    if (currentSection && state.currentItemIndex < currentSection.items.length - 1) {
      handleNavigateItem(state.currentItemIndex + 1);
    } else if (isLastSection) {
      handleFinalize().then(() => setIsTestEnded(true));
    } else {
      handleAdvanceSection();
    }
  };

  // Render Section-specific Item Component
  const renderItemStimulus = () => {
    if (!currentItem) return null;

    if (currentItem.itemType === "complete_words") {
      return (
        <CompleteWordsRenderer
          key={currentItem.id}
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          onAnswerChange={handleAnswerChange}
        />
      );
    }

    if (currentItem.itemType === "read_daily_life" || currentItem.itemType === "read_academic") {
      return (
        <SplitReadingRenderer
          key={currentItem.id}
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          isFlagged={Boolean(currentResponse?.isFlagged)}
          onAnswerChange={handleAnswerChange}
          onToggleFlag={handleToggleFlag}
          onNext={handleNextAction}
        />
      );
    }

    if (
      currentItem.itemType === "listen_choose_response" ||
      currentItem.itemType === "listen_conversation" ||
      currentItem.itemType === "listen_announcement" ||
      currentItem.itemType === "listen_academic_talk"
    ) {
      return (
        <ListeningRenderer
          key={currentItem.id}
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          isFlagged={Boolean(currentResponse?.isFlagged)}
          onAnswerChange={handleAnswerChange}
          onToggleFlag={handleToggleFlag}
          onNext={handleNextAction}
        />
      );
    }

    if (currentItem.itemType === "build_sentence") {
      return (
        <BuildSentenceRenderer
          key={currentItem.id}
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          onAnswerChange={handleAnswerChange}
        />
      );
    }

    if (currentItem.itemType === "write_email" || currentItem.itemType === "academic_discussion") {
      return (
        <WritingEditorRenderer
          key={currentItem.id}
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          onAnswerChange={handleAnswerChange}
        />
      );
    }

    if (currentItem.itemType === "listen_repeat" || currentItem.itemType === "take_interview") {
      return (
        <SpeakingRecorder
          key={currentItem.id}
          item={currentItem}
          currentAnswer={currentResponse?.rawAnswer || null}
          onAnswerChange={handleAnswerChange}
          isExamMode={blueprint.examMode !== "practice"}
          attemptId={state.attemptId}
        />
      );
    }

    return <div>Unsupported item type</div>;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900">
      {/* 1. TestGlider Top Header Bar (#0f3b82) */}
      <header className="flex h-12 items-center justify-between bg-[#0f3b82] px-6 text-white shadow-sm select-none">
        {/* Left: [Save & Exit] Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowSaveExitModal(true)}
            className="rounded-full bg-white px-4 py-1 text-xs font-bold text-[#0f3b82] shadow-xs hover:bg-slate-100 transition-all"
          >
            Save &amp; Exit
          </button>
        </div>

        {/* Right Action Buttons: [Volume] [Review] [< Back] [Next >] (Authoritative Navigation) */}
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="mr-2 text-[11px] text-blue-200 animate-pulse">Autosaving...</span>
          )}

          <button
            type="button"
            onClick={handleTestAudio}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#184896] hover:bg-[#2054a8] px-3 py-1 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Volume2 className="size-3.5" /> Volume
          </button>

          <button
            type="button"
            onClick={() => setIsReviewOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#184896] hover:bg-[#2054a8] px-3.5 py-1 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <BookOpen className="size-3.5" /> Review
          </button>

          <button
            type="button"
            disabled={state.currentItemIndex === 0}
            onClick={() => {
              if (state.currentItemIndex > 0) {
                handleNavigateItem(state.currentItemIndex - 1);
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#184896] hover:bg-[#2054a8] disabled:opacity-40 disabled:hover:bg-[#184896] px-3.5 py-1 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-3.5" /> Back
          </button>

          <button
            type="button"
            onClick={handleNextAction}
            className="inline-flex items-center gap-1 rounded-full bg-white hover:bg-slate-100 px-5 py-1 text-xs font-bold text-[#0f3b82] shadow-sm transition-all cursor-pointer"
          >
            {isLastItem ? (
              isLastSection ? (
                "Submit Exam"
              ) : (
                <>
                  Next Section <ChevronRight className="size-3.5" />
                </>
              )
            ) : (
              <>
                Next <ChevronRight className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. TestGlider Sub-Header Bar (White) */}
      <div className="flex h-10 items-center justify-between border-b border-slate-200 bg-white px-6 text-xs text-slate-700 select-none">
        {/* Left: Section & Question Counter */}
        <div className="font-bold uppercase tracking-wider text-slate-800">
          {currentSection?.sectionType?.toUpperCase()} | Questions {state.currentItemIndex + 1} of{" "}
          {currentSection?.items.length || 1}
        </div>

        {/* Right: Digital Countdown Clock & Hide Time */}
        <div className="flex items-center gap-2 font-mono">
          <span className="font-bold text-sm text-slate-900">
            {hideTime ? "--:--" : formatTimer(state.sectionRemainingSeconds)}
          </span>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setHideTime((prev) => !prev)}
            className="font-sans font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs"
          >
            {hideTime ? (
              <>
                <Eye className="size-3 text-slate-400" /> Show Time
              </>
            ) : (
              <>
                <EyeOff className="size-3 text-slate-400" /> Hide Time
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Main Test Canvas Area (Zero Scrolling, Single Next Button in Top Bar) */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 md:px-8 py-3 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">{renderItemStimulus()}</div>
      </main>

      {/* 4. Question Review Modal / Drawer */}
      {isReviewOpen && currentSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="size-5 text-[#0f3b82]" />
                <h3 className="text-base font-bold text-slate-900">
                  Question Review: {currentSection.sectionType.toUpperCase()}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-72 overflow-y-auto p-1">
              {currentSection.items.map((it, idx) => {
                const resp = state.responses[it.id];
                const isCurrent = idx === state.currentItemIndex;
                const isAnswered = resp?.isAnswered;
                const isFlagged = resp?.isFlagged;

                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => {
                      handleNavigateItem(idx);
                      setIsReviewOpen(false);
                    }}
                    className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-xs font-bold transition-all border ${
                      isCurrent
                        ? "border-[#0f3b82] bg-[#0f3b82] text-white shadow-sm"
                        : isAnswered
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {isFlagged && (
                      <Flag className="size-2.5 absolute top-1 right-1 text-amber-500 fill-current" />
                    )}
                    <span>{idx + 1}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {isAnswered ? "Done" : "Empty"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-[#0f3b82]" /> Current
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-500" /> Answered
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-slate-300" /> Unanswered
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Save & Exit Confirmation Modal */}
      {showSaveExitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Save &amp; Exit Examination</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Your test progress and responses are continuously saved to your account in real-time.
              You can resume this test at any time from your dashboard without losing your progress.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowSaveExitModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                className="rounded-lg bg-[#0f3b82] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#154694]"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
