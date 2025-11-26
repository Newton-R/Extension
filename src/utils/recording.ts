export type RecordingQuality = "high" | "medium" | "low";

export const QUALITY_PRESETS = {
  high: {
    video: {
      width: 1920,
      height: 1080,
      frameRate: 60,
      bitrate: 8_000_000,
    },
    audio: {
      sampleRate: 48_000,
      bitrate: 320_000,
    },
  },
  medium: {
    video: {
      width: 1280,
      height: 720,
      frameRate: 30,
      bitrate: 4_000_000,
    },
    audio: {
      sampleRate: 44_100,
      bitrate: 192_000,
    },
  },
  low: {
    video: {
      width: 854,
      height: 480,
      frameRate: 24,
      bitrate: 2_000_000,
    },
    audio: {
      sampleRate: 44_100,
      bitrate: 128_000,
    },
  },
} as const satisfies Record<RecordingQuality, unknown>;

export function generateFilename(
  kind: "recording" | "screenshot",
  ext: string
) {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
  const prefix = kind === "recording" ? "prorec" : "proshot";
  return `${prefix}_${stamp}.${ext}`;
}

export function estimateFileSizeBytes(
  durationSeconds: number,
  {
    videoBitrate,
    audioBitrate,
  }: {
    videoBitrate: number; // bits per second
    audioBitrate: number; // bits per second
  }
) {
  const totalBitrate = videoBitrate + audioBitrate;
  const bits = totalBitrate * durationSeconds;
  return bits / 8;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** idx;
  return `${value.toFixed(1)} ${units[idx]}`;
}

/**
 * Combine a screen stream and a camera stream into a single canvas-captured MediaStream.
 * Returns a MediaStream that can be passed to MediaRecorder. The function will continuously
 * draw both video tracks onto a canvas using requestAnimationFrame.
 */
export async function combineStreams(
  screenStream: MediaStream,
  cameraStream: MediaStream | null,
  opts?: {
    fps?: number;
    cameraScale?: number;
    cameraPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  }
): Promise<MediaStream> {
  const fps = opts?.fps ?? 30;
  const cameraScale = opts?.cameraScale ?? 0.2;
  const cameraPosition = opts?.cameraPosition ?? "bottom-right";

  const screenTrack = screenStream.getVideoTracks()[0];
  const settings = screenTrack.getSettings();
  const width = (settings.width as number) || 1280;
  const height = (settings.height as number) || 720;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D | null;
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const screenVideo = document.createElement("video");
  screenVideo.srcObject = screenStream;
  screenVideo.muted = true;
  screenVideo.playsInline = true;

  let cameraVideo: HTMLVideoElement | null = null;
  if (cameraStream) {
    cameraVideo = document.createElement("video");
    cameraVideo.srcObject = cameraStream;
    cameraVideo.muted = true;
    cameraVideo.playsInline = true;
  }

  await Promise.all([
    screenVideo.play().catch(() => undefined),
    cameraVideo ? cameraVideo.play().catch(() => undefined) : Promise.resolve(),
  ]);

  let rafId: number | null = null;

  function draw() {
    // draw screen full
    const c = ctx!;
    c.clearRect(0, 0, canvas.width, canvas.height);
    try {
      c.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
    } catch (err) {
      // ignore occasional draw errors when frames not ready
    }

    if (cameraVideo) {
      const camW = Math.floor(canvas.width * cameraScale);
      const camH = Math.floor(
        (camW * (cameraVideo.videoHeight || 9)) / (cameraVideo.videoWidth || 16)
      );
      const padding = Math.max(8, Math.floor(canvas.width * 0.01));

      let x = canvas.width - camW - padding;
      let y = canvas.height - camH - padding;
      if (cameraPosition.startsWith("top")) y = padding;
      if (cameraPosition.startsWith("left")) x = padding;

      try {
        // draw camera with rounded corner mask
        const radius = 12;
        c.save();
        roundRect(c, x, y, camW, camH, radius);
        c.clip();
        c.drawImage(cameraVideo, x, y, camW, camH);
        c.restore();
        // border
        c.strokeStyle = "rgba(255,255,255,0.8)";
        c.lineWidth = 4;
        roundRect(c, x, y, camW, camH, radius);
        c.stroke();
      } catch (err) {
        // ignore draw errors
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  // start drawing loop
  draw();

  const streamOut = canvas.captureStream(fps);

  // attach audio tracks: prefer screenStream audio tracks then cameraStream audio tracks
  const audioTracks = [
    ...screenStream.getAudioTracks(),
    ...(cameraStream ? cameraStream.getAudioTracks() : []),
  ];
  for (const at of audioTracks) {
    streamOut.addTrack(at);
  }

  // wire a cleanup method on the stream so callers can stop the loop when finished
  (streamOut as any)._cleanup = () => {
    if (rafId != null) cancelAnimationFrame(rafId);
    try {
      screenVideo.pause();
      screenVideo.srcObject = null;
    } catch {}
    if (cameraVideo) {
      try {
        cameraVideo.pause();
        cameraVideo.srcObject = null;
      } catch {}
    }
  };

  return streamOut;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const minR = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + minR, y);
  ctx.arcTo(x + w, y, x + w, y + h, minR);
  ctx.arcTo(x + w, y + h, x, y + h, minR);
  ctx.arcTo(x, y + h, x, y, minR);
  ctx.arcTo(x, y, x + w, y, minR);
  ctx.closePath();
}
