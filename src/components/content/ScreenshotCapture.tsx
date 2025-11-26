import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { downloadBlob } from "../../utils/download";

interface ScreenshotCaptureProps {
  active: boolean;
  onComplete: () => void;
}

export function ScreenshotCapture({
  active,
  onComplete,
}: ScreenshotCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<HTMLDivElement | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!active) return;

    const overlay = overlayRef.current;
    const selection = selectionRef.current;
    if (!overlay || !selection) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      startPos.current = { x: e.clientX, y: e.clientY };
      selection.style.left = `${e.clientX}px`;
      selection.style.top = `${e.clientY}px`;
      selection.style.width = "0px";
      selection.style.height = "0px";
      selection.style.display = "block";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!startPos.current) return;
      const x = Math.min(e.clientX, startPos.current.x);
      const y = Math.min(e.clientY, startPos.current.y);
      const w = Math.abs(e.clientX - startPos.current.x);
      const h = Math.abs(e.clientY - startPos.current.y);
      selection.style.left = `${x}px`;
      selection.style.top = `${y}px`;
      selection.style.width = `${w}px`;
      selection.style.height = `${h}px`;
    };

    const onMouseUp = () => {
      startPos.current = null;
    };

    overlay.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      overlay.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [active]);

  if (!active) return null;

  const capture = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: "png",
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = () => resolve(null)));

      const canvas = (canvasRef.current ||= document.createElement("canvas"));
      const ctx = canvas.getContext("2d");
      if (!ctx || !overlayRef.current || !selectionRef.current) return;

      const rect = selectionRef.current.getBoundingClientRect();
      const scaleX = img.width / window.innerWidth;
      const scaleY = img.height / window.innerHeight;

      canvas.width = rect.width * scaleX;
      canvas.height = rect.height * scaleY;
      ctx.drawImage(
        img,
        rect.left * scaleX,
        rect.top * scaleY,
        rect.width * scaleX,
        rect.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const qualityFactor =
        quality === "high" ? 0.92 : quality === "medium" ? 0.8 : 0.6;
      const croppedDataUrl = canvas.toDataURL("image/png", qualityFactor);
      setPreview(croppedDataUrl);
    } catch (error) {
      console.error("Failed to capture screenshot", error);
      onComplete();
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    const res = await fetch(preview);
    const blob = await res.blob();
    await downloadBlob(blob, { kind: "screenshot", mimeType: "image/png" });
    setPreview(null);
    onComplete();
  };

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-999998 bg-black/40 cursor-crosshair"
        aria-label="Screenshot overlay"
      >
        <div
          ref={selectionRef}
          className="absolute border border-dashed border-red-400 bg-red-500/10"
          style={{ display: "none" }}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/90 px-4 py-2 text-[11px] text-slate-100 flex items-center gap-3">
          <span>Select area to capture</span>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as typeof quality)}
            className="h-6 rounded-full border border-slate-700 bg-slate-900/80 px-2 text-[10px]"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button size="sm" variant="primary" onClick={capture}>
            Capture
          </Button>
          <Button size="sm" variant="ghost" onClick={onComplete}>
            Cancel
          </Button>
        </div>
      </div>

      <Modal
        open={!!preview}
        onClose={() => {
          setPreview(null);
          onComplete();
        }}
        title="Screenshot preview"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setPreview(null)}>
              <X className="h-3 w-3 mr-1" /> Retake
            </Button>
            <Button size="sm" variant="primary" onClick={handleSave}>
              <Check className="h-3 w-3 mr-1" /> Save
            </Button>
          </>
        }
      >
        {preview && (
          <img
            src={preview}
            alt="Screenshot preview"
            className="max-h-80 w-full object-contain"
          />
        )}
      </Modal>
    </>
  );
}
