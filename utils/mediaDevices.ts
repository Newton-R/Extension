export async function getDisplayMedia(constraints: DisplayMediaStreamOptions) {
  try {
    // In extension contexts prefer chrome.desktopCapture (Chrome) or browser APIs
    // If desktopCapture is available (background/service worker) use it to get a stream id
    // then call getUserMedia with chromeMediaSourceId. Otherwise fall back to
    // navigator.mediaDevices.getDisplayMedia when available.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav: any = navigator;

    // Chrome extensions can use chrome.desktopCapture.chooseDesktopMedia in background pages
    // This helper will attempt to use it when available. Note: in MV3 service workers this may
    // not be present; content scripts and popups should use getDisplayMedia where possible.
    // We wrap this logic so callers can use the same API.

    // reference chrome from window to avoid TS global name errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chromeDesktopCapture = (window as any).chrome as any;

    if (chromeDesktopCapture && chromeDesktopCapture.chooseDesktopMedia) {
      const streamId: string | null = await new Promise((resolve) => {
        try {
          chromeDesktopCapture.desktopCapture.chooseDesktopMedia(
            ["screen", "window", "tab", "audio"],
            (id: string) => {
              resolve(id || null);
            }
          );
        } catch (err) {
          console.warn("desktopCapture.chooseDesktopMedia failed", err);
          resolve(null);
        }
      });

      if (streamId) {
        // Build constraints to get the desktop stream via getUserMedia using chromeMediaSourceId
        // Some environments require the use of the 'mandatory' object; we provide both forms.
        const constraintsForId: any = {
          audio: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: streamId,
            },
          },
          video: {
            mandatory: {
              chromeMediaSource: "desktop",
              chromeMediaSourceId: streamId,
              ...((constraints && (constraints as any).video) || {}),
            },
          },
        };

        return await nav.mediaDevices.getUserMedia(constraintsForId);
      }
    }

    if (nav.mediaDevices?.getDisplayMedia) {
      return await nav.mediaDevices.getDisplayMedia(constraints);
    }

    throw new Error("getDisplayMedia is not supported in this context");
  } catch (error) {
    console.error("getDisplayMedia error", error);
    throw error;
  }
}

export async function getUserMedia(constraints: MediaStreamConstraints) {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error("getUserMedia error", error);
    throw error;
  }
}
