import { useEffect, useState } from "react";
import {
  ChevronDown,
  Mic,
  MonitorPlay,
  Video,
  Camera,
  SlidersHorizontal,
} from "lucide-react";
import type { RecorderSettings } from "../../utils/storage";
import { getSettings, saveSettings } from "../../utils/storage";
import { Button } from "../../components/ui/Button";
import { Toggle } from "../../components/ui/Toggle";
import {
  QualitySelector,
  SourcePicker,
} from "../../components/QualitySelector";
import { useDraggable } from "../../hooks/useDraggable";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onApply: (settings: RecorderSettings) => void;
}

export function SettingsPanel({ open, onClose, onApply }: SettingsPanelProps) {
  const [settings, setSettings] = useState<RecorderSettings | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const { style, onMouseDown } = useDraggable({
    x: window.innerWidth - 380,
    y: 120,
  });

  useEffect(() => {
    if (!open) return;
    getSettings().then((s) => setSettings(s));
  }, [open]);

  useEffect(() => {
    if (!settings) return;
    const id = setTimeout(() => saveSettings(settings), 400);
    return () => clearTimeout(id);
  }, [settings]);

  if (!open || !settings) return null;

  const update = <K extends keyof RecorderSettings>(
    key: K,
    value: RecorderSettings[K]
  ) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const toggleSection = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = () => {
    if (!settings) return;
    onApply(settings);
    onClose();
  };

  return (
    <div
      className="floating-panel w-[360px] max-h-[80vh] flex flex-col overflow-hidden bg-background"
      style={style}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="drag-handle flex items-center justify-between"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
            <SlidersHorizontal className="h-3 w-3" />
          </span>
          <div>
            <p className="font-semibold">Recording Settings</p>
            <p className="text-[11px] text-slate-400">
              Configure capture sources and quality.
            </p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Close settings"
          onClick={onClose}
        >
          ×
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-xs">
        {/* Recording mode */}
        <section>
          <button
            className="flex w-full items-center justify-between py-1 text-left"
            onClick={() => toggleSection("mode")}
          >
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              <MonitorPlay className="h-3 w-3" /> Recording mode
            </span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                collapsed.mode ? "-rotate-90" : ""
              }`}
            />
          </button>
          {!collapsed.mode && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: "screen", label: "Screen", icon: MonitorPlay },
                { id: "camera", label: "Camera", icon: Video },
                { id: "audio", label: "Audio only", icon: Mic },
                { id: "screenshot", label: "Screenshot", icon: Camera },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => update("mode", id as RecorderSettings["mode"])}
                  className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-[11px] transition-colors ${
                    settings.mode === id
                      ? "border-red-500 bg-red-500/10 text-red-100"
                      : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-500"
                  }`}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800">
                    <Icon className="h-3 w-3" />
                  </span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Source selection */}
        <section>
          <button
            className="flex w-full items-center justify-between py-1 text-left"
            onClick={() => toggleSection("source")}
          >
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              <MonitorPlay className="h-3 w-3" /> Source
            </span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                collapsed.source ? "-rotate-90" : ""
              }`}
            />
          </button>
          {!collapsed.source && (
            <div className="mt-2">
              <SourcePicker
                value={settings.source}
                onChange={(v) => update("source", v)}
              />
            </div>
          )}
        </section>

        {/* Quality */}
        <section>
          <button
            className="flex w-full items-center justify-between py-1 text-left"
            onClick={() => toggleSection("quality")}
          >
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="h-3 w-3" /> Quality
            </span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                collapsed.quality ? "-rotate-90" : ""
              }`}
            />
          </button>
          {!collapsed.quality && (
            <div className="mt-2">
              <QualitySelector
                value={settings.quality}
                onChange={(v) => update("quality", v)}
              />
            </div>
          )}
        </section>

        {/* Audio */}
        <section>
          <button
            className="flex w-full items-center justify-between py-1 text-left"
            onClick={() => toggleSection("audio")}
          >
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              <Mic className="h-3 w-3" /> Audio
            </span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                collapsed.audio ? "-rotate-90" : ""
              }`}
            />
          </button>
          {!collapsed.audio && (
            <div className="mt-2 space-y-2">
              <p className="text-[11px] text-slate-400">Audio source</p>
              <div className="grid grid-cols-2 gap-2">
                {["microphone", "system", "both", "none"].map((src) => (
                  <button
                    key={src}
                    onClick={() =>
                      update(
                        "audioSource",
                        src as RecorderSettings["audioSource"]
                      )
                    }
                    className={`rounded-xl border px-2 py-1.5 text-[11px] capitalize ${
                      settings.audioSource === src
                        ? "border-red-500 bg-red-500/10 text-red-100"
                        : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-slate-500"
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span>Microphone</span>
                <Toggle
                  checked={settings.microphoneEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update("microphoneEnabled", e.target.checked)
                  }
                />
              </div>
            </div>
          )}
        </section>

        {/* Camera */}
        <section>
          <button
            className="flex w-full items-center justify-between py-1 text-left"
            onClick={() => toggleSection("camera")}
          >
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              <Video className="h-3 w-3" /> Camera
            </span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                collapsed.camera ? "-rotate-90" : ""
              }`}
            />
          </button>
          {!collapsed.camera && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span>Webcam overlay</span>
                <Toggle
                  checked={settings.webcamEnabled}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update("webcamEnabled", e.target.checked)
                  }
                />
              </div>
            </div>
          )}
        </section>

        {/* Advanced */}
        <section>
          <button
            className="flex w-full items-center justify-between py-1 text-left"
            onClick={() => toggleSection("advanced")}
          >
            <span className="font-semibold text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="h-3 w-3" /> Advanced
            </span>
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                collapsed.advanced ? "-rotate-90" : ""
              }`}
            />
          </button>
          {!collapsed.advanced && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span>Countdown</span>
                <select
                  className="h-7 rounded-lg border border-slate-700 bg-slate-900/60 px-2 text-[11px] text-slate-50"
                  value={settings.countdownSeconds}
                  onChange={(e) =>
                    update(
                      "countdownSeconds",
                      Number(
                        e.target.value
                      ) as RecorderSettings["countdownSeconds"]
                    )
                  }
                >
                  <option value={0}>None</option>
                  <option value={3}>3 seconds</option>
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500">
                Keyboard shortcuts, auto-save, and notifications are enabled by
                default.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 px-4 py-3">
        <p className="text-[11px] text-slate-400">
          Changes are saved automatically.
        </p>
        <Button size="sm" variant="primary" onClick={handleApply}>
          Apply & close
        </Button>
      </div>
    </div>
  );
}
