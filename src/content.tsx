import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CameraPreview } from "./components/content/CameraPreview";
import { SettingsPanel } from "./components/content/SettingsPanel";
import { Timer } from "./components/content/Timer";
import { Controls } from "./components/content/Controls";

const ContentApp = () => {
  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCamera, setShowCamera] = useState(true);

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: "stop-recording" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (response && response.success) {
        setIsRecording(false);
        const container = document.getElementById("recorder-pro-root");
        if (container) {
          // Unmounting the React root and removing the container
          // This is a bit of a workaround to get the root.
          // In a real app, you might manage this differently.
          const tempRoot = createRoot(container);
          tempRoot.unmount();
          container.remove();
        }
      } else {
        console.error("Failed to stop recording:", response?.error);
      }
    });
  };

  const handleTogglePause = () => {
    // In a real implementation, you'd send a message to the background script
    // to pause or resume the MediaRecorder.
    setIsPaused(!isPaused);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 2147483647, // A very high z-index
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '10px'
    }}>
      {showCamera && <CameraPreview open={showCamera} />}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '10px',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'white'
      }}>
        {isRecording && <Timer isPaused={isPaused} />}
        <Controls
          isRecording={isRecording}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onStop={handleStop}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onToggleCamera={() => setShowCamera(!showCamera)}
        />
      </div>
      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onApply={() => {
          // Handle applying settings
          setShowSettings(false);
        }}
      />
    </div>
  );
};

// Check if the root element already exists to avoid creating it multiple times
if (!document.getElementById("recorder-pro-root")) {
  const container = document.createElement("div");
  container.id = "recorder-pro-root";
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<ContentApp />);
}
