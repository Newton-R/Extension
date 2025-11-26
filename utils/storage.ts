export type RecorderSettings = {
  mode: 'screen' | 'camera' | 'audio' | 'screenshot';
  source: 'screen' | 'window' | 'tab' | 'application';
  audioSource: 'microphone' | 'system' | 'both' | 'none';
  quality: 'high' | 'medium' | 'low';
  frameRate: 24 | 30 | 60;
  webcamEnabled: boolean;
  microphoneEnabled: boolean;
  screenshotQuality: 'high' | 'medium' | 'low';
  countdownSeconds: 0 | 3 | 5 | 10;
  theme: 'light' | 'dark' | 'system';
};

const DEFAULT_SETTINGS: RecorderSettings = {
  mode: 'screen',
  source: 'screen',
  audioSource: 'microphone',
  quality: 'high',
  frameRate: 60,
  webcamEnabled: true,
  microphoneEnabled: true,
  screenshotQuality: 'high',
  countdownSeconds: 3,
  theme: 'system',
};

const STORAGE_KEY = 'prorecorder:settings';

export async function getSettings(): Promise<RecorderSettings> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEY] ?? {}) };
  } catch (error) {
    console.error('Failed to load settings', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: RecorderSettings): Promise<void> {
  try {
    await browser.storage.local.set({
      [STORAGE_KEY]: settings,
    });
  } catch (error) {
    console.error('Failed to save settings', error);
  }
}
