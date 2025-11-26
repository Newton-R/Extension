import { useEffect, useState } from "react";
import { SettingsPanel } from "./SettingsPanel";
import { ControlsPanel, type RecordingStatus } from "./ControlsPanel";
import { CameraPreview } from "./CameraPreview";
import { ScreenshotCapture } from "./ScreenshotCapture";
import { useScreenCapture } from "../../hooks/useScreenCapture";
import { useMediaRecorder } from "../../hooks/useMediaRecorder";
import { useAudioStream } from "../../hooks/useAudioStream";
import { downloadBlob } from "../../utils/download";
import { addRecordingHistory } from "../../utils/history";
import { showRecordingNotification } from "../../utils/permissions";
import { getSettings, type RecorderSettings } from "../../utils/storage";

export function OverlayRoot() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState<RecorderSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [status, setStatus] = useState<RecordingStatus>("ready");
  const [latestBlob, setLatestBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { stream, startCapture, stopCapture } = useScreenCapture();
  const { state, durationMs, start, stop, pause, resume } = useMediaRecorder({
    onStop: async (blob, _duration) => {
      setLatestBlob(blob);
      setStatus("ready");
    },
  });
  const { audioLevel } = useAudioStream(stream);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      // Don't auto-show camera here, wait for user action
    });

    // Notify background that content script has mounted (useful for debugging)
    try {
      const webext = (globalThis as any).browser ?? (globalThis as any).chrome;
      webext?.runtime
        ?.sendMessage?.({ type: "CONTENT_SCRIPT_MOUNTED" })
        .catch(() => {});
    } catch {}

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
      }
    };
    window.addEventListener("keydown", keyHandler);

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (state === "recording") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);

    const msgHandler = () => {
      // Not used; Chrome extensions use browser.runtime.onMessage. See below.
    };
    window.addEventListener("message", msgHandler);

    const customEventHandler = (event: Event) => {
      const customEvent = event as CustomEvent;
      const message = customEvent.detail;
      console.log("content: custom message received", message);

      if (message?.type === "SHOW_OVERLAY") {
        setVisible(true);
        try {
          const webext =
            (globalThis as any).browser ?? (globalThis as any).chrome;
          webext?.runtime
            ?.sendMessage?.({ type: "OVERLAY_SHOWN", reason: "SHOW_OVERLAY" })
            .catch(() => {});
        } catch {}
      }
      if (message?.type === "SHOW_OVERLAY_SETTINGS") {
        setVisible(true);
        setShowSettings(true);
        try {
          const webext =
            (globalThis as any).browser ?? (globalThis as any).chrome;
          webext?.runtime
            ?.sendMessage?.({
              type: "OVERLAY_SHOWN",
              reason: "SHOW_OVERLAY_SETTINGS",
            })
            .catch(() => {});
        } catch {}
      }
      if (message?.type === "SHOW_OVERLAY_AND_START") {
        setVisible(true);
        // Mode-specific behaviour could be added here based on message.mode
        handleStart(message.mode);
        try {
          const webext =
            (globalThis as any).browser ?? (globalThis as any).chrome;
          webext?.runtime
            ?.sendMessage?.({
              type: "OVERLAY_SHOWN",
              reason: "SHOW_OVERLAY_AND_START",
            })
            .catch(() => {});
        } catch {}
      }
      if (message?.type === "COMMAND_START_RECORDING") {
        handleStart();
      }
      if (message?.type === "COMMAND_STOP_RECORDING") {
        handleStop();
      }
      if (message?.type === "COMMAND_TAKE_SCREENSHOT") {
        setScreenshotMode(true);
      }
    };

    window.addEventListener("prorecorder-message", customEventHandler);

    return () => {
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("message", msgHandler);
      window.removeEventListener("prorecorder-message", customEventHandler);
    };
  }, [state]);

  if (!visible) return null;

  const handleApplySettings = (s: RecorderSettings) => {
    setSettings(s);
    setShowCamera(s.webcamEnabled);
  };

  const handleStartRecordingNow = async (overrideMode?: string) => {
    const currentMode = overrideMode || settings?.mode || "screen";

    if (currentMode === "screenshot") {
      setScreenshotMode(true);
      return;
    }

    if (currentMode === "camera") {
      setShowCamera(true);
    } else if (settings?.webcamEnabled) {
      setShowCamera(true);
    }

    setStatus("processing");
    const displayStream = await startCapture(currentMode as any);
    if (!displayStream) {
      setStatus("ready");
      return;
    }
    await showRecordingNotification("Recording started");
    start(displayStream);
    setStatus("recording");
  };

  const handleStart = async (mode?: string) => {
    const countdown = settings?.countdownSeconds ?? 0;
    if (!countdown) {
      await handleStartRecordingNow(mode);
      return;
    }

    let remaining = countdown;
    setCountdown(remaining);

    const timer = window.setInterval(async () => {
      remaining -= 1;
      if (remaining <= 0) {
        window.clearInterval(timer);
        setCountdown(null);
        await handleStartRecordingNow(mode);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  };

  const handleStop = () => {
    stop();
    stopCapture();
    setStatus("processing");
  };

  const handleSave = async () => {
    if (!latestBlob) return;
    const mimeType = latestBlob.type || "video/webm";
    await downloadBlob(latestBlob, { kind: "recording", mimeType });

    // Add to history with basic metadata
    await addRecordingHistory({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      durationMs,
      filename: "",
      mimeType,
    });

    await showRecordingNotification("Recording saved");
    setLatestBlob(null);
  };

  const handleDiscard = () => {
    setLatestBlob(null);
  };

  const effectiveStatus: RecordingStatus =
    state === "recording"
      ? "recording"
      : state === "paused"
      ? "paused"
      : status;

  return (
    <>
      {countdown != null && (
        <div className="fixed bottom-8 left-8 z-999999 flex h-24 w-24 items-center justify-center rounded-full bg-black/70 text-3xl font-semibold text-white">
          {countdown}
        </div>
      )}

      <ControlsPanel
        open
        status={effectiveStatus}
        durationMs={durationMs}
        audioLevel={audioLevel}
        onStart={handleStart}
        onStop={handleStop}
        onPause={pause}
        onResume={resume}
        onDiscard={handleDiscard}
        onSave={handleSave}
        onOpenSettings={() => setShowSettings(true)}
      />

      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onApply={handleApplySettings}
      />

      <CameraPreview open={showCamera} />

      <ScreenshotCapture
        active={screenshotMode}
        onComplete={() => setScreenshotMode(false)}
      />
    </>
  );
}
