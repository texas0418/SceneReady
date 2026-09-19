// Local backup: serialize every AsyncStorage key the app owns into one JSON
// blob the actor can copy out, and restore from that blob. No network, no
// account. The keys mirror the STORAGE_KEY constants in each provider.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BACKUP_KEYS = [
  'favorite_tools',
  'has_seen_onboarding',
  'audition_tracker',
  'user_monologues',
  'rehearsal_journal',
  'character_breakdowns',
  'sides_annotations',
  'app_settings',
] as const;

export interface BackupPayload {
  app: string;
  version: number;
  exportedAt: string;
  data: Record<string, string>;
}

export async function exportAllData(): Promise<string> {
  const pairs = await AsyncStorage.multiGet(BACKUP_KEYS as unknown as string[]);
  const data: Record<string, string> = {};
  for (const [key, value] of pairs) {
    if (value != null) data[key] = value;
  }
  const payload: BackupPayload = {
    app: 'SceneReady',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
  return JSON.stringify(payload, null, 2);
}

export async function importAllData(json: string): Promise<number> {
  let parsed: BackupPayload;
  try {
    parsed = JSON.parse(json) as BackupPayload;
  } catch {
    throw new Error('That does not look like valid backup text.');
  }
  if (!parsed || typeof parsed !== 'object' || !parsed.data) {
    throw new Error('That is not a SceneReady backup.');
  }
  const allowed = new Set<string>(BACKUP_KEYS as unknown as string[]);
  const entries = Object.entries(parsed.data).filter(
    ([key, value]) => allowed.has(key) && typeof value === 'string'
  ) as [string, string][];
  if (entries.length === 0) {
    throw new Error('This backup has no data to restore.');
  }
  await AsyncStorage.multiSet(entries);
  return entries.length;
}
