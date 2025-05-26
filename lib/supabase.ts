import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';

// Log Supabase URL and key (without exposing full key)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL available:', !!supabaseUrl);
console.log('Supabase key available:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: !supabaseUrl ? 'missing' : 'present',
    key: !supabaseKey ? 'missing' : 'present'
  });
}

// Secure storage implementation for Supabase
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Local storage fallback for web
const BrowserLocalStorageAdapter = {
  getItem: (key: string) => {
    const value = localStorage.getItem(key);
    return Promise.resolve(value);
  },
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Use the appropriate storage adapter based on platform
const storageAdapter = Platform.OS === 'web' 
  ? BrowserLocalStorageAdapter 
  : ExpoSecureStoreAdapter;

// Initialize the Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Types for chat messages
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  user_id: string;
  content: string;
  role: MessageRole;
  created_at: string;
  conversation_date: string;
}

// Types for user profile
export interface Profile {
  id: string;
  email: string;
  current_streak: number;
  last_engaged_date: string | null;
  created_at: string;
}