import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
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

const supabaseUrl = 'https://yjmxvovfmjswnjxgdidf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqbXh2b3ZmbWpzd25qeGdkaWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTA0MjksImV4cCI6MjA5MDg2NjQyOX0.dhMSnTAirqcTm5uN33aaxUzxGmvZB-zDEGpBlVj8B0I';

export const supabase = createClient <Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
