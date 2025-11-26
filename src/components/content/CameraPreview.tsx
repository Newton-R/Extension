import { useEffect, useRef } from "react";
import { useCameraStream } from "../../hooks/useCameraStream";
import { useDraggable } from "../../hooks/useDraggable";

interface CameraPreviewProps {
  open: boolean;
}

export function CameraPreview({ open }: CameraPreviewProps) {
  const { stream, start, stop } = useCameraStream();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { style, onMouseDown } = useDraggable({
    x: 30,
    y: 950,
  });

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }
    start();
  }, [open, start, stop]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  if (!open) return null;

  return (
    <div
      className={`camera-preview h-44 w-44 bottom-4 left-4 flex flex-col floating-panel cursor-grab rounded-full border-border`}
      aria-label="Camera preview"
      onMouseDown={onMouseDown}
      style={style}
    >
      <video
        ref={videoRef}
        className={`h-full w-full object-cover`}
        muted
        playsInline
      />
    </div>
  );
}
