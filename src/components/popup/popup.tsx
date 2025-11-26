import { Clock } from "lucide-react";
import { quickActions } from "../../constants";

export const Popup = () => {
  const handleQuickStart = async (mode: string) => {
    await chrome.runtime.sendMessage({ type: "OPEN_OVERLAY_AND_START", mode });

    window.close();
  };
  return (
    <section className="grid grid-cols-2 gap-3">
      {quickActions.map(({ id, icon: Icon, label, description, mode }) => (
        <button
          key={id}
          onClick={() => handleQuickStart(mode)}
          className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-left hover:border-red-500/70 hover:bg-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-100 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <Icon className="h-4 w-4" />
            </span>
            <Clock className="h-3 w-3 text-slate-500" />
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-50">{label}</p>
            <p className="mt-1 text-[11px] text-slate-400 leading-snug line-clamp-2">
              {description}
            </p>
          </div>
        </button>
      ))}
    </section>
  );
};
