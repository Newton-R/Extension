export async function requestDesktopCapture(): Promise<string | null> {
  return new Promise((resolve) => {
    // reference chrome from window to avoid TS global name errors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chromeAny = (window as any).chrome as any;
    if (!chromeAny?.desktopCapture?.chooseDesktopMedia) {
      resolve(null);
      return;
    }

    try {
      chromeAny.desktopCapture.chooseDesktopMedia(
        ["screen", "window", "tab"],
        (streamId: any) => {
          if (!streamId) resolve(null);
          else resolve(streamId as string);
        }
      );
    } catch (err) {
      console.warn("desktopCapture.chooseDesktopMedia error", err);
      resolve(null);
    }
  });
}

export async function showRecordingNotification(message: string) {
  if (!("notifications" in chrome)) return;
  try {
    await chrome.notifications.create({
      type: "basic",
      iconUrl: "icon/128.png",
      title: "ProRecorder",
      message,
    });
  } catch (error) {
    console.error("Failed to show notification", error);
  }
}
