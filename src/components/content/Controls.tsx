import React from "react";
import {
  Pause,
  Play,
  Square,
  Settings,
  Camera,
  CameraOff,
} from "lucide-react";

interface ControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  onToggleSettings: () => void;
  onToggleCamera: () => void;
  showCamera: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  isRecording,
  isPaused,
  onTogglePause,
  onStop,
  onToggleSettings,
  onToggleCamera,
  showCamera,
}) => {
  if (!isRecording) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onTogglePause}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        title={isPaused ? "Resume" : "Pause"}
      >
        {isPaused ? (
          <Play className="h-4 w-4 text-white" />
        ) : (
          <Pause className="h-4 w-4 text-white" />
        )}
      </button>
      <button
        onClick={onStop}
        className="p-2 rounded-full bg-red-500 hover:bg-red-400"
        title="Stop"
      >
        <Square className="h-4 w-4 text-white" />
      </button>
      <button
        onClick={onToggleSettings}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        title="Settings"
      >
        <Settings className="h-4 w-4 text-white" />
      </button>
      <button
        onClick={onToggleCamera}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        title={showCamera ? "Hide Camera" : "Show Camera"}
      >
        {showCamera ? (
          <CameraOff className="h-4 w-4 text-white" />
        ) : (
          <Camera className="h-4 w-4 text-white" />
        )}
      </button>
    </div>
  );
};
