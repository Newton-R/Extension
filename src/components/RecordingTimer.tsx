interface RecordingTimerProps {
  durationMs: number;
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((total % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function RecordingTimer({ durationMs }: RecordingTimerProps) {
  return <span className="timer-display">{formatDuration(durationMs)}</span>;
}
