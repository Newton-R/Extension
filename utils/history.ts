export interface RecordingHistoryEntry {
  id: string;
  createdAt: number; // epoch ms
  durationMs: number;
  filename: string;
  mimeType: string;
}

const HISTORY_KEY = 'prorecorder:history';
const MAX_ENTRIES = 20;

export async function getRecordingHistory(): Promise<RecordingHistoryEntry[]> {
  try {
    const result = await browser.storage.local.get(HISTORY_KEY);
    return (result[HISTORY_KEY] as RecordingHistoryEntry[] | undefined) ?? [];
  } catch (error) {
    console.error('Failed to read recording history', error);
    return [];
  }
}

export async function addRecordingHistory(entry: RecordingHistoryEntry): Promise<void> {
  const history = await getRecordingHistory();
  const next = [entry, ...history].slice(0, MAX_ENTRIES);
  try {
    await browser.storage.local.set({ [HISTORY_KEY]: next });
  } catch (error) {
    console.error('Failed to write recording history', error);
  }
}
