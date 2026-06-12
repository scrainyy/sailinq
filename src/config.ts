/**
 * ⬇️  TUTAJ WKLEJASZ SWOJE 2 WARTOŚCI Z SUPABASE  ⬇️
 *
 * Gdzie je znaleźć (powiem Ci dokładnie krok po kroku):
 *   Supabase → Twój projekt → Project Settings (ikona koła zębatego)
 *   → "Data API"  (lub "API")
 *     • Project URL          → wklej do SUPABASE_URL
 *     • API Keys → "anon public" → wklej do SUPABASE_ANON_KEY
 *
 * Klucz "anon public" jest bezpieczny do trzymania w aplikacji —
 * dostęp do danych chroni osobny mechanizm (RLS) w bazie.
 */

export const SUPABASE_URL = 'https://vosziqaceoileditgpbl.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvc3ppcWFjZW9pbGVkaXRncGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjE2NTIsImV4cCI6MjA5NjgzNzY1Mn0.Sqke1viU8sq8JQIF8-hXd221TPIL2xCzoT_8DoWN0Bk';

/** Czy klucze zostały już uzupełnione (do pokazania ekranu-instrukcji jeśli nie). */
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith('http') && SUPABASE_ANON_KEY.length > 20;
