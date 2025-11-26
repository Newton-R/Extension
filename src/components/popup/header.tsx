import { Settings } from "lucide-react";
import { Button } from "../ui/Button";

export const Header = () => {
  const handleOpenSettings = async () => {
    await chrome.runtime.sendMessage({ type: "OPEN_SETTINGS_PANEL" });
    window.close();
  };

  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-base font-semibold flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-xl">
            <span className="h-3 w-3 rounded-full bg-white" />
          </span>
          <span>ProRecorder</span>
        </h1>
        <p className="text-xs text-text mt-1">
          Quick start a new recording or screenshot.
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={handleOpenSettings}
        aria-label="Open settings"
        size="icon"
        className="bg-background/80! border border-border"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </header>
  );
};
