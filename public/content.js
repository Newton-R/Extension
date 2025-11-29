
""
import React from "react";
import { createRoot } from "react-dom/client";
import  {CameraPreview } from "../src/components/content/CameraPreview";


chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_WIDGET") {
    showWidget(message.mode);
  }
});


function showWidget(mode) {
  const container = document.createElement("div");
  container.id = "my-extension-root";
  document.body.appendChild(container);
    container.style.position = "fixed";
    container.style.bottom = "0";

  const root = createRoot(container);
  root.render(React.createElement(CameraPreview, { open: true }));
}
