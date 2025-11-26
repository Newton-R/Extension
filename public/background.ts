export default defineBackground(() => {
  console.log("ProRecorder background ready", { id: chrome.runtime.id });

  // Open overlay when the toolbar icon is clicked
  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    await chrome.tabs
      .sendMessage(tab.id, { type: "SHOW_OVERLAY" })
      .catch(() => {
        // Content script might not be injected yet for some URLs
      });
  });

  // Handle keyboard shortcuts (commands)
  chrome.commands?.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    if (command === "start-recording") {
      await chrome.tabs.sendMessage(tab.id, {
        type: "COMMAND_START_RECORDING",
      });
    } else if (command === "stop-recording") {
      await chrome.tabs.sendMessage(tab.id, {
        type: "COMMAND_STOP_RECORDING",
      });
    } else if (command === "take-screenshot") {
      await chrome.tabs.sendMessage(tab.id, {
        type: "COMMAND_TAKE_SCREENSHOT",
      });
    }
  });

  chrome.runtime.onMessage.addListener(async (message, sender) => {
    console.log("background: received runtime message", { message, sender });

    // If message is coming from popup (no sender.tab) forward to the active tab
    const sendToActiveTab = async (payload: any) => {
      // reference webextension API from globalThis to avoid relying on global 'chrome' symbol
      const webext = (globalThis as any).chrome ?? (globalThis as any).chrome;

      // try sender.tab first
      if (sender?.tab?.id) {
        await webext.tabs
          .sendMessage(sender.tab.id, payload)
          .catch((err: unknown) => {
            console.warn("background: sendMessage to sender.tab failed", err);
          });
        return;
      }

      // otherwise find the active tab in the current window
      const [active] = await webext.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (active?.id) {
        let sent = false;
        // Retry sending message a few times before giving up or trying injection
        for (let i = 0; i < 3; i++) {
          try {
            await webext.tabs.sendMessage(active.id, payload);
            sent = true;
            console.log("background: message sent to active tab", {
              tabId: active.id,
              payload,
            });
            break;
          } catch (err) {
            // Wait a bit before retrying
            await new Promise((r) => setTimeout(r, 200));
          }
        }

        if (sent) return;

        console.warn(
          "background: initial sendMessage failed, will try to inject content script"
        );

        // If initial send failed, try injecting the content script (files fallback, then tag fallback)
        if (!sent) {
          try {
            if (webext.scripting?.executeScript) {
              try {
                await webext.scripting.executeScript({
                  target: { tabId: active.id },
                  files: ["content-scripts/content.js"],
                });
                console.log(
                  "background: injected content script (files) into tab",
                  active.id
                );
              } catch (filesErr) {
                console.warn(
                  "background: executeScript(files) failed",
                  filesErr
                );
                try {
                  const contentUrl = webext.runtime.getURL(
                    "content-scripts/content.js"
                  );
                  await webext.scripting.executeScript({
                    target: { tabId: active.id },
                    func: (src: string) => {
                      try {
                        if (
                          document.getElementById("prorecorder-content-loader")
                        )
                          return;
                        const s = document.createElement("script");
                        s.id = "prorecorder-content-loader";
                        s.src = src;
                        s.defer = true;
                        document.documentElement.appendChild(s);
                      } catch (e) {
                        // ignore
                      }
                    },
                    args: [contentUrl],
                  });
                  console.log(
                    "background: injected content script (tag) into tab",
                    active.id
                  );
                } catch (tagErr) {
                  console.warn("background: tag injection failed", tagErr);
                }
              }
            } else if (webext.tabs?.executeScript) {
              try {
                await webext.tabs.executeScript(active.id, {
                  file: "content-scripts/content.js",
                } as any);
                console.log(
                  "background: injected content script via tabs.executeScript",
                  active.id
                );
              } catch (teErr) {
                console.warn(
                  "background: tabs.executeScript injection failed",
                  teErr
                );
              }
            }
          } catch (injectErr) {
            console.warn(
              "background: content script injection failed",
              injectErr
            );
          }

          // wait a longer moment for content script to initialize
          await new Promise((r) => setTimeout(r, 1000));

          try {
            await webext.tabs.sendMessage(active.id, payload);
            sent = true;
            console.log(
              "background: message sent to active tab after injection",
              { tabId: active.id, payload }
            );
          } catch (err2: any) {
            console.warn(
              "background: sendMessage still failed after injection",
              err2
            );
          }
        }

        // Always show a feedback banner so users get immediate UI feedback
        try {
          const injectBanner = async () => {
            if (webext.scripting?.executeScript) {
              await webext.scripting.executeScript({
                target: { tabId: active.id },
                func: () => {
                  try {
                    const id = "prorecorder-feedback-banner";
                    if (document.getElementById(id)) return;
                    const el = document.createElement("div");
                    el.id = id;
                    el.textContent = "Opening ProRecorder…";
                    Object.assign(el.style, {
                      position: "fixed",
                      right: "16px",
                      bottom: "16px",
                      padding: "10px 14px",
                      background: "rgba(0,0,0,0.8)",
                      color: "white",
                      borderRadius: "10px",
                      zIndex: "9999999999",
                      fontFamily: "sans-serif",
                      fontSize: "13px",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                    });
                    document.documentElement.appendChild(el);
                    setTimeout(() => {
                      try {
                        el.remove();
                      } catch {}
                    }, 2200);
                  } catch (e) {
                    // ignore
                  }
                },
              });
            } else if (webext.tabs?.executeScript) {
              await webext.tabs.executeScript(active.id, {
                code: `(function(){const id='prorecorder-feedback-banner'; if(document.getElementById(id)) return; const el=document.createElement('div'); el.id=id; el.textContent='Opening ProRecorder…'; Object.assign(el.style,{position:'fixed',right:'16px',bottom:'16px',padding:'10px 14px',background:'rgba(0,0,0,0.8)',color:'white',borderRadius:'10px',zIndex:'9999999999',fontFamily:'sans-serif',fontSize:'13px',boxShadow:'0 6px 20px rgba(0,0,0,0.4)'}); document.documentElement.appendChild(el); setTimeout(()=>{try{el.remove()}catch{}} ,2200)})();`,
              });
            }
          };
          injectBanner().catch(() => {});
        } catch (err) {
          // ignore banner injection errors
        }

        // If not sent after all attempts, notify the user
        if (!sent) {
          console.warn(
            "background: failed to deliver message to tab after injection attempts",
            { tabId: active.id, payload }
          );
          try {
            await webext.notifications.create({
              type: "basic",
              iconUrl: "icon/128.png",
              title: "ProRecorder",
              message: `Failed to open overlay in the current tab`,
            });
          } catch {}
        }

        return;
      }

      console.warn("background: no active tab found to forward message", {
        payload,
      });
      try {
        await webext.notifications.create({
          type: "basic",
          iconUrl: "icon/128.png",
          title: "ProRecorder",
          message: "Could not open overlay: no active tab detected",
        });
      } catch (err) {
        // ignore notification errors
      }
    };

    if (message?.type === "OPEN_OVERLAY_AND_START") {
      await sendToActiveTab({
        type: "SHOW_OVERLAY_AND_START",
        mode: message.mode,
      });
    }

    if (message?.type === "OPEN_SETTINGS_PANEL") {
      await sendToActiveTab({ type: "SHOW_OVERLAY_SETTINGS" });
    }
  });
});
function defineBackground(arg0: () => void) {
  console.log(arg0);
  throw new Error("Function not implemented.");
}
