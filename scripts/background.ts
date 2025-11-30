chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

let mediaRecorder: MediaRecorder | null = null;
let data: Blob[] = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "start-recording") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        sendResponse({ success: false, error: "No active tab found." });
        return;
      }

      const { mode } = message;

      const handleStream = (stream: MediaStream | null) => {
        if (chrome.runtime.lastError || !stream) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError?.message || "Failed to get stream.",
          });
          return;
        }

        mediaRecorder = new MediaRecorder(stream);
        data = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            data.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(data, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          chrome.downloads.download({
            url: url,
            filename: "recording.webm",
          });
          stream.getTracks().forEach((track) => track.stop());
          mediaRecorder = null;
        };

        mediaRecorder.start();
        sendResponse({ success: true });

        if (tab.id) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });
        }

        stream.getVideoTracks()[0].onended = () => {
          if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
        };
      };

      if (mode === "tab") {
        chrome.tabCapture.capture({ audio: true, video: true }, handleStream);
      } else if (mode === "screen" || mode === "window") {
        chrome.desktopCapture.chooseDesktopMedia(
          ["screen", "window"],
          tab,
          (streamId) => {
            if (streamId) {
              navigator.mediaDevices
                .getUserMedia({
                  video: {
                    // @ts-expect-error
                    mandatory: {
                      chromeMediaSource: "desktop",
                      chromeMediaSourceId: streamId,
                    },
                  },
                  audio: {
                    // @ts-expect-error
                    mandatory: {
                      chromeMediaSource: "desktop",
                      chromeMediaSourceId: streamId,
                    },
                  },
                })
                .then(handleStream)
                .catch(() => {
                  sendResponse({
                    success: false,
                    error: "Failed to get user media.",
                  });
                });
            } else {
              sendResponse({ success: false, error: "No stream ID selected." });
            }
          },
        );
      }
    });

    return true; // Indicates async response.
  }

  if (message.type === "stop-recording") {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "Not recording." });
    }
    return true;
  }
});
