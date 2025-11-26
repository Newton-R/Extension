interface AudioVisualizerProps {
  level: number; // 0-1
}

export function AudioVisualizer({ level }: AudioVisualizerProps) {
  const clamped = Math.max(0, Math.min(1, level));
  const bars = 12;

  return (
    <div className="flex items-end gap-0.5 h-4" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const ratio = (i + 1) / bars;
        const active = clamped > 1 - ratio;
        return (
          <div
            key={i}
            className="w-[3px] rounded-full bg-slate-600 overflow-hidden"
          >
            <div
              className={
                "w-full rounded-full bg-green-400 transition-all duration-150 ease-out"
              }
              style={{
                height: `${active ? (0.3 + clamped * 0.7) * 100 : 0}%`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
