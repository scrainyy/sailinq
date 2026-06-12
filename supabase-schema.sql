-- ============================================================
--  SAILINQ — przepis na bazę danych (krok 1: profile + rejsy)
--  Wklej CAŁOŚĆ do Supabase → SQL Editor → New query → Run.
--  Można uruchamiać wielokrotnie (jest "if not exists" / "drop").
-- ============================================================

-- ---------- TABELA: profiles ----------
-- Jeden wiersz na użytkownika. Połączona z wbudowaną tabelą auth.users.
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text,
  age             int,
  role            text default 'crew',          -- 'skipper' | 'crew' | 'both'
  location        text,
  bio             text,
  photo           text,
  miles           int  default 0,
  miles_verified  int  default 0,
  trips_count     int  default 0,
  rating          numeric(2,1) default 0,
  reviews_count   int  default 0,
  verified        boolean default false,
  tags            text[] default '{}',
  created_at      timestamptz default now()
);

-- ---------- TABELA: trips (rejsy) ----------
create table if not exists public.trips (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references public.profiles(id) on delete cascade,
  route           text not null,
  region          text,
  dates           text,          -- np. "12–19 lip" (prosty tekst na start)
  date_from       date,
  date_to         date,
  boat            text,
  price           text,
  berths_total    int  default 6,
  berths_taken    int  default 0,
  level           text,
  photo           text,
  description     text,
  included        text[] default '{}',
  requirements    text[] default '{}',
  skipper_name    text,
  skipper_cert    text,
  created_at      timestamptz default now()
);

-- ---------- Automatyczne tworzenie profilu po rejestracji ----------
-- Gdy ktoś się zarejestruje (auth.users), tworzymy mu pusty profil.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Nowy żeglarz'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  BEZPIECZEŃSTWO (RLS — Row Level Security)
--  Domyślnie blokujemy wszystko, potem wpuszczamy konkretne akcje.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.trips    enable row level security;

-- PROFILE: każdy zalogowany widzi wszystkie profile (do Discover);
--          ale edytować można tylko swój.
drop policy if exists "profiles_read_all"   on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_read_all"
  on public.profiles for select
  to authenticated using (true);
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- REJSY: każdy zalogowany widzi wszystkie rejsy;
--        tworzyć/edytować/usuwać może tylko właściciel.
drop policy if exists "trips_read_all"    on public.trips;
drop policy if exists "trips_insert_own"  on public.trips;
drop policy if exists "trips_update_own"  on public.trips;
drop policy if exists "trips_delete_own"  on public.trips;
create policy "trips_read_all"
  on public.trips for select
  to authenticated using (true);
create policy "trips_insert_own"
  on public.trips for insert
  to authenticated with check (auth.uid() = owner_id);
create policy "trips_update_own"
  on public.trips for update
  to authenticated using (auth.uid() = owner_id);
create policy "trips_delete_own"
  on public.trips for delete
  to authenticated using (auth.uid() = owner_id);

-- Gotowe ✅
