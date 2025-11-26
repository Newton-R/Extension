import { useCallback, useEffect, useRef, useState } from 'react';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

interface UseMediaRecorderOptions {
  mimeType?: string;
  onStop?: (blob: Blob, durationMs: number) => void;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}) {
  const { mimeType = 'video/webm;codecs=vp9,opus', onStop } = options;

  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);

  const chunksRef = useRef<BlobPart[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(
    (stream: MediaStream) => {
      try {
        setError(null);
        chunksRef.current = [];
        setDurationMs(0);

        const recorder = new MediaRecorder(stream, { mimeType });
        recorderRef.current = recorder;

        recorder.ondataavailable = (evt) => {
          if (evt.data && evt.data.size > 0) {
            chunksRef.current.push(evt.data);
          }
        };

        recorder.onerror = (evt) => {
          console.error('MediaRecorder error', evt.error);
          setError(evt.error?.message ?? 'Recording error');
          setState('idle');
        };

        recorder.onstart = () => {
          startTimeRef.current = performance.now();
          setState('recording');
          clearTimer();
          timerRef.current = window.setInterval(() => {
            if (!startTimeRef.current) return;
            setDurationMs(performance.now() - startTimeRef.current);
          }, 1000);
        };

        recorder.onpause = () => setState('paused');
        recorder.onresume = () => setState('recording');

        recorder.onstop = () => {
          clearTimer();
          setState('stopped');
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const duration = startTimeRef.current
            ? performance.now() - startTimeRef.current
            : durationMs;
          if (onStop) onStop(blob, duration);
        };

        recorder.start(250); // collect data every 250ms
      } catch (err) {
        console.error('Failed to start recording', err);
        setError((err as Error).message);
        setState('idle');
      }
    },
    [mimeType, onStop, durationMs],
  );

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const pause = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume();
    }
  }, []);

  useEffect(() => () => clearTimer(), []);

  return {
    state,
    error,
    durationMs,
    isRecording: state === 'recording',
    isPaused: state === 'paused',
    start,
    stop,
    pause,
    resume,
  };
}
