-- Migracja 01: dodaj kolumnę "dates" (tekst) do istniejącej tabeli trips.
-- Wklej do Supabase → SQL Editor → Run. Bezpieczne (if not exists).
alter table public.trips add column if not exists dates text;
