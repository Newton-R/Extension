import { useCallback, useEffect, useState } from 'react';
import { getUserMedia } from '../utils/mediaDevices';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export function useCameraStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((t) => t.stop());
      return null;
    });
  }, []);

  const start = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      };
      const media = await getUserMedia(constraints);
      setStream(media);
      return media;
    } catch (err) {
      console.error('Failed to start camera', err);
      setError((err as Error).message);
      return null;
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(
        all
          .filter((d) => d.kind === 'videoinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || 'Camera' })),
      );
    } catch (err) {
      console.error('Failed to enumerate devices', err);
    }
  }, []);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  return { stream, devices, error, start, stop, refreshDevices };
}
