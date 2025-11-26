import React from "react";
import ReactDOM from "react-dom/client";
import { OverlayRoot } from "./content/OverlayRoot";
import "../styles/index.css";

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  runAt: "document_idle",
  cssInjectionMode: "ui",
  main() {
    // 1. Setup Global Listener immediately to acknowledge messages
    try {
      const webext = (globalThis as any).browser ?? (globalThis as any).chrome;
      webext.runtime.onMessage.addListener(
        (message: any, sender: any, sendResponse: any) => {
          // Dispatch to UI
          window.dispatchEvent(
            new CustomEvent("prorecorder-message", { detail: message })
          );
          // We don't need to return anything specific, just having the listener prevents the error.
        }
      );
    } catch (e) {
      console.error("Failed to setup message listener", e);
    }

    const containerId = "prorecorder-overlay-root";
    if (document.getElementById(containerId)) return;

    const container = document.createElement("div");
    container.id = containerId;
    document.documentElement.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <OverlayRoot />
      </React.StrictMode>
    );
  },
});
