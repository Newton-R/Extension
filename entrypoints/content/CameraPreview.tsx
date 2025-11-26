import { useEffect, useRef, useState } from 'react';
import { Camera, Minimize2, Maximize2, FlipHorizontal } from 'lucide-react';
import { useCameraStream } from '../../hooks/useCameraStream';
import { Button } from '../../components/ui/Button';

export type CameraPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface CameraPreviewProps {
  open: boolean;
}

export function CameraPreview({ open }: CameraPreviewProps) {
  const { stream, start, stop } = useCameraStream();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [position, setPosition] = useState<CameraPosition>('bottom-right');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [minimized, setMinimized] = useState(false);
  const [mirror, setMirror] = useState(true);

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

  const basePos: Record<CameraPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const sizeCls: Record<typeof size, string> = {
    sm: 'w-40 h-24',
    md: 'w-56 h-32',
    lg: 'w-72 h-40',
  } as const;

  return (
    <div className={`camera-preview ${basePos[position]} ${sizeCls[size]} flex flex-col`}
      aria-label="Camera preview"
    >
      <div className="flex items-center justify-between px-2 py-1 text-[11px] bg-slate-950/80">
        <span className="flex items-center gap-1 text-slate-100">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <Camera className="h-3 w-3" />
          <span>Camera</span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMirror((m) => !m)}
            aria-label="Toggle mirror mode"
          >
            <FlipHorizontal className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMinimized((m) => !m)}
            aria-label={minimized ? 'Maximize camera' : 'Minimize camera'}
          >
            {minimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      {!minimized && (
        <video
          ref={videoRef}
          className={`h-full w-full object-cover ${mirror ? 'scale-x-[-1]' : ''}`}
          muted
          playsInline
        />
      )}
      <div className="flex items-center justify-between px-2 py-1 bg-slate-950/90 text-[10px] text-slate-200">
        <div className="flex items-center gap-1">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`h-5 min-w-[22px] rounded-full border text-[10px] capitalize ${size === s ? 'border-red-500 bg-red-500/20 text-red-200' : 'border-slate-700 hover:border-slate-500'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPosition(p)}
              className={`h-4 w-4 rounded-full border ${position === p ? 'border-red-500 bg-red-500/40' : 'border-slate-600 hover:border-slate-400'}`}
              aria-label={`Move camera to ${p}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
