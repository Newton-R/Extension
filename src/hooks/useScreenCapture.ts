import { useCallback, useState } from "react";
import { getDisplayMedia } from "../utils/mediaDevices";

export type CaptureType = "screen" | "window" | "tab";

export function useScreenCapture() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCapture = useCallback(async (type: CaptureType) => {
    console.log(type);
    try {
      setError(null);
      const media = await getDisplayMedia({
        video: true,
        audio: true,
      });
      setStream(media);
      return media;
    } catch (err) {
      console.error("Failed to start screen capture", err);
      setError((err as Error).message);
      return null;
    }
  }, []);

  const stopCapture = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  return {
    stream,
    error,
    startCapture,
    stopCapture,
  };
}
