import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Guarda o token de acesso entre aberturas do app.
// No celular usa o armazenamento seguro do sistema (Keychain/Keystore); na web, o armazenamento do navegador.
const KEY = 'nutrifybe.accessToken';
const useSecure = Platform.OS === 'ios' || Platform.OS === 'android';

export async function saveSessionToken(token: string) {
  try {
    if (useSecure) await SecureStore.setItemAsync(KEY, token);
    else await AsyncStorage.setItem(KEY, token);
  } catch {
    // Sem armazenamento disponível: a sessão vale só enquanto o app estiver aberto.
  }
}

export async function loadSessionToken(): Promise<string | null> {
  try {
    return useSecure ? await SecureStore.getItemAsync(KEY) : await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function clearSessionToken() {
  try {
    if (useSecure) await SecureStore.deleteItemAsync(KEY);
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // Nada a limpar.
  }
}
