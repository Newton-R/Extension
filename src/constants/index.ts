import { Camera, Mic, MonitorPlay, Video } from "lucide-react";

export const quickActions = [
  {
    id: "screen",
    icon: MonitorPlay,
    label: "Screen + Mic",
    description: "Capture your screen with microphone audio",
    mode: "screen",
  },
  {
    id: "camera",
    icon: Video,
    label: "Camera Only",
    description: "Record just your webcam and mic",
    mode: "camera",
  },
  {
    id: "audio",
    icon: Mic,
    label: "Audio Only",
    description: "Record microphone or system audio",
    mode: "audio",
  },
  {
    id: "screenshot",
    icon: Camera,
    label: "Screenshot",
    description: "Capture your current screen or area",
    mode: "screenshot",
  },
] as const;
