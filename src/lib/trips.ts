import { supabase } from '@/lib/supabase';

/** Domyślne zdjęcie rejsu, dopóki nie dodamy wgrywania własnych. */
export const DEFAULT_TRIP_PHOTO =
  'https://images.unsplash.com/photo-1500627964684-141351970a7f?w=800&q=80';

/** Dane z formularza tworzenia rejsu. */
export type NewTrip = {
  route: string;
  akwen?: string;
  dates?: string;
  boat?: string;
  price?: string;
  berths_total: number;
  level?: string;
  description?: string;
  skipper_name?: string;
  skipper_cert?: string;
};

/** Kształt rejsu używany przez ekrany UI (camelCase, gotowy do wyświetlenia). */
export type TripView = {
  id: string;
  route: string;
  dates: string;
  boat: string;
  price: string;
  berthsTaken: number;
  berthsTotal: number;
  level: string;
  photo: string;
  akwen: string;
  isMine: boolean;
  description: string;
  included: string[];
  requirements: string[];
  skipperName: string;
  skipperCert: string;
  host: string;
  hostAvatar: string;
  hostRating: number;
  hostTrips: number;
};

// Wiersz tak jak przychodzi z bazy (z dołączonym profilem właściciela).
type TripRow = {
  id: string;
  owner_id: string | null;
  route: string | null;
  akwen: string | null;
  dates: string | null;
  boat: string | null;
  price: string | null;
  berths_total: number | null;
  berths_taken: number | null;
  level: string | null;
  photo: string | null;
  description: string | null;
  included: string[] | null;
  requirements: string[] | null;
  skipper_name: string | null;
  skipper_cert: string | null;
  owner: { name: string | null; avatar: string | null; rating: number | null; trips_count: number | null } | null;
};

const SELECT = '*, owner:profiles!owner_id(name, avatar, rating, trips_count)';

function toView(row: TripRow, myId: string | null): TripView {
  return {
    id: row.id,
    route: row.route ?? 'Rejs',
    dates: row.dates ?? '',
    boat: row.boat ?? '',
    price: row.price ?? '',
    berthsTaken: row.berths_taken ?? 0,
    berthsTotal: row.berths_total ?? 0,
    level: row.level ?? '',
    photo: row.photo || DEFAULT_TRIP_PHOTO,
    akwen: row.akwen ?? '',
    isMine: !!myId && row.owner_id === myId,
    description: row.description ?? '',
    included: row.included ?? [],
    requirements: row.requirements ?? [],
    skipperName: row.skipper_name ?? '',
    skipperCert: row.skipper_cert ?? '',
    host: row.owner?.name ?? 'Organizator',
    hostAvatar: row.owner?.avatar ?? '',
    hostRating: row.owner?.rating ?? 0,
    hostTrips: row.owner?.trips_count ?? 0,
  };
}

/** Utwórz nowy rejs (właścicielem zostaje zalogowany użytkownik). */
export async function createTrip(input: NewTrip): Promise<{ id?: string; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: 'Musisz być zalogowany.' };

  const { data, error } = await supabase
    .from('trips')
    .insert({
      owner_id: userId,
      route: input.route,
      akwen: input.akwen,
      dates: input.dates,
      boat: input.boat,
      price: input.price,
      berths_total: input.berths_total,
      berths_taken: 0,
      level: input.level,
      description: input.description,
      skipper_name: input.skipper_name,
      skipper_cert: input.skipper_cert,
      photo: DEFAULT_TRIP_PHOTO,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

/** Pobierz wszystkie rejsy (najnowsze pierwsze). */
export async function listTrips(): Promise<{ trips: TripView[]; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const myId = userData.user?.id ?? null;

  const { data, error } = await supabase
    .from('trips')
    .select(SELECT)
    .order('created_at', { ascending: false });

  if (error) return { trips: [], error: error.message };
  return { trips: (data as TripRow[]).map((r) => toView(r, myId)) };
}

/** Pobierz jeden rejs po id. */
export async function getTrip(id: string): Promise<{ trip?: TripView; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const myId = userData.user?.id ?? null;

  const { data, error } = await supabase.from('trips').select(SELECT).eq('id', id).single();
  if (error) return { error: error.message };
  return { trip: toView(data as TripRow, myId) };
}
