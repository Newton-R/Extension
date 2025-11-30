import { Clock } from "lucide-react";
import { quickActions } from "../../constants";

export const Popup = () => {
  const handlestart = (mode: string) => {
    chrome.runtime.sendMessage(
      { type: "start-recording", mode },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
        if (response && response.success) {
          window.close();
        } else {
          console.error("Failed to start recording:", response?.error);
        }
      },
    );
  };

  return (
    <section className="grid grid-cols-2 gap-3">
      {quickActions.map(({ id, icon: Icon, label, description, mode }) => (
        <button
          key={id}
          onClick={() => handlestart(mode)}
          className="group rounded-2xl border border-border bg-background/80 p-3 text-left hover:border-primary/70 hover:bg-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-ring-offset-background"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-muted group-hover:bg-primary group-hover:text-white transition-colors">
              <Icon className="h-4 w-4" />
            </span>
            <Clock className="h-3 w-3 text-muted-foreground" />
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
