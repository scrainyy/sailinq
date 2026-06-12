import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from '@/config';

// Zanim wklejone zostaną prawdziwe klucze, używamy poprawnego "atrapowego"
// adresu, żeby createClient nie rzucił błędem przy starcie (ekran-instrukcja
// i tak przechwyci użytkownika zanim cokolwiek wyśle do tej atrapy).
const url = isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co';
const key = isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-anon-key';

/**
 * Jedno połączenie z Supabase używane w całej aplikacji.
 * - AsyncStorage: zapamiętuje zalogowanie między uruchomieniami apki
 * - autoRefreshToken: sam odświeża sesję, żeby user nie wylatywał
 */
export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
