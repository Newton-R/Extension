import { Pause, Play, Square, Trash2, Download, Settings, Radio } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { RecordingTimer } from '../../components/RecordingTimer';
import { AudioVisualizer } from '../../components/AudioVisualizer';
import { useDraggable } from '../../hooks/useDraggable';

export type RecordingStatus = 'ready' | 'recording' | 'paused' | 'processing';

interface ControlsPanelProps {
  open: boolean;
  status: RecordingStatus;
  durationMs: number;
  audioLevel: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onDiscard: () => void;
  onSave: () => void;
  onOpenSettings: () => void;
}

export function ControlsPanel({
  open,
  status,
  durationMs,
  audioLevel,
  onStart,
  onStop,
  onPause,
  onResume,
  onDiscard,
  onSave,
  onOpenSettings,
}: ControlsPanelProps) {
  const { style, onMouseDown } = useDraggable({
    x: window.innerWidth / 2 - 200,
    y: window.innerHeight - 80,
  });

  if (!open) return null;

  const isRecording = status === 'recording';
  const isPaused = status === 'paused';

  return (
    <div
      className="floating-panel flex items-center gap-3 bg-slate-950/95 px-3 py-2 rounded-full border border-slate-800"
      style={style}
      onMouseDown={onMouseDown}
    >
      <div className="flex items-center gap-2">
        <span className="recording-indicator" aria-hidden="true" />
        <div className="flex flex-col">
          <span className="text-[11px] font-medium capitalize text-slate-200 flex items-center gap-1">
            <Radio className="h-3 w-3" /> {status}
          </span>
          <RecordingTimer durationMs={durationMs} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === 'ready' && (
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            aria-label="Start recording"
          >
            <Play className="h-4 w-4 mr-1" /> Start
          </Button>
        )}

        {(isRecording || isPaused) && (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={onStop}
              aria-label="Stop recording"
            >
              <Square className="h-4 w-4 mr-1" /> Stop
            </Button>
            {isRecording ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPause}
                aria-label="Pause recording"
              >
                <Pause className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={onResume}
                aria-label="Resume recording"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
          </>
        )}

        {status === 'processing' && (
          <span className="text-[11px] text-slate-300">Processing…</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <AudioVisualizer level={audioLevel} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          aria-label="Open settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDiscard}
          aria-label="Discard recording"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={onSave}
          aria-label="Save recording"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
