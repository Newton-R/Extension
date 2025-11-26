import { Settings } from "lucide-react";

export const Header = () => {
  const handleOpenSettings = async () => {
    await chrome.runtime.sendMessage({ type: "OPEN_SETTINGS_PANEL" });
    window.close();
  };

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-recorder-xl">
            <span className="h-3 w-3 rounded-full bg-white" />
          </span>
          <span>ProRecorder</span>
        </h1>
        <p className="text-xs text-text mt-1">
          Quick start a new recording or screenshot.
        </p>
      </div>
      <button
        onClick={handleOpenSettings}
        className="btn-secondary px-3! py-2! rounded-full"
        aria-label="Open settings"
      >
        <Settings className="h-4 w-4" />
      </button>
    </header>
  );
};
