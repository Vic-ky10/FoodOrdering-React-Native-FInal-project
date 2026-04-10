import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { Database } from '@/database.types';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const getExpoHost = () => {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] || null;
};

const getSupabaseUrl = () => {
  const rawUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();

  if (!rawUrl) {
    return '';
  }

  try {
    const url = new URL(rawUrl);
    const isLoopbackHost =
      url.hostname === '127.0.0.1' || url.hostname === 'localhost';

    // Android cannot reach the host machine through localhost. Prefer Expo's
    // dev host when available, and fall back to the emulator bridge address.
    if (Platform.OS === 'android' && isLoopbackHost) {
      url.hostname = getExpoHost() || '10.0.2.2';
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return rawUrl;
  }
};

export const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON || "";

export const supabase = createClient <Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
