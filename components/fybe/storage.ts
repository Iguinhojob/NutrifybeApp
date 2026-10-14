import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Preferências do Fybe guardadas no aparelho. Só o necessário para não repetir
 * apresentações: nenhum dado pessoal ou de saúde é salvo aqui.
 */
export type FybePrefs = { introSeen: boolean; completed: Record<string, boolean> };

const KEY = 'nutrifybe:fybe:v1';
export const DEFAULT_PREFS: FybePrefs = { introSeen: false, completed: {} };

export async function loadFybePrefs(): Promise<FybePrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      introSeen: parsed?.introSeen === true,
      completed: parsed?.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function saveFybePrefs(prefs: FybePrefs) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* sem armazenamento: vale só nesta sessão */ }
}
