import { generateFilename } from "./recording";

export async function downloadBlob(
  blob: Blob,
  options: {
    kind: "recording" | "screenshot";
    filename?: string;
    mimeType?: string;
  }
) {
  const { kind, filename, mimeType } = options;
  const name =
    filename ?? generateFilename(kind, mimeType?.split("/")[1] ?? "webm");

  const url = URL.createObjectURL(blob);

  try {
    if (typeof chrome !== "undefined" && chrome.downloads?.download) {
      await chrome.downloads.download({
        url,
        filename: name,
        saveAs: true,
      });
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}
