import { roleLabel } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

/** Profil w formie gotowej na kartę Discover. */
export type DiscoverProfile = {
  id: string;
  name: string;
  age: number | null;
  roleLabel: string;
  location: string;
  rating: number;
  reviews: number;
  miles: number;
  milesVerified: number;
  trips: number;
  verified: boolean;
  tags: string[];
  photo: string; // zdjęcie na kartę (avatar, a w razie braku tło)
};

type Row = {
  id: string;
  name: string | null;
  age: number | null;
  role: string | null;
  location: string | null;
  rating: number | null;
  reviews_count: number | null;
  miles: number | null;
  miles_verified: number | null;
  trips_count: number | null;
  verified: boolean | null;
  tags: string[] | null;
  avatar: string | null;
  photo: string | null;
};

function toCard(row: Row): DiscoverProfile {
  return {
    id: row.id,
    name: row.name ?? 'Żeglarz',
    age: row.age,
    roleLabel: roleLabel(row.role ?? 'crew'),
    location: row.location ?? '',
    rating: row.rating ?? 0,
    reviews: row.reviews_count ?? 0,
    miles: row.miles ?? 0,
    milesVerified: row.miles_verified ?? 0,
    trips: row.trips_count ?? 0,
    verified: row.verified ?? false,
    tags: row.tags ?? [],
    photo: row.avatar || row.photo || '',
  };
}

export type DiscoverFilters = {
  role?: string; // '' | 'skipper' | 'crew' | 'both'
  onlyVerified?: boolean;
  location?: string;
};

/** Profile do pokazania (nie ja, nie już przeswipowani), z opcjonalnymi filtrami. */
export async function listDiscoverProfiles(
  filters: DiscoverFilters = {}
): Promise<{ profiles: DiscoverProfile[]; error?: string }> {
  const { data, error } = await supabase.rpc('discover_profiles', {
    p_role: filters.role || null,
    p_only_verified: filters.onlyVerified ?? false,
    p_location: filters.location || null,
  });
  if (error) return { profiles: [], error: error.message };
  return { profiles: (data as Row[]).map(toCard) };
}

/**
 * Zapisz polubienie/pominięcie. Jeśli polubienie i druga osoba też Cię
 * wcześniej polubiła → zwraca matched: true.
 */
export async function recordSwipe(
  targetId: string,
  liked: boolean
): Promise<{ matched: boolean; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { matched: false, error: 'Nie jesteś zalogowany.' };

  const { error } = await supabase
    .from('swipes')
    .upsert({ swiper_id: userId, target_id: targetId, liked }, { onConflict: 'swiper_id,target_id' });
  if (error) return { matched: false, error: error.message };

  if (!liked) return { matched: false };

  // Trigger w bazie tworzy match przy wzajemnym polubieniu — sprawdzamy czy powstał.
  const { data: m } = await supabase
    .from('matches')
    .select('id')
    .or(
      `and(user_a.eq.${userId},user_b.eq.${targetId}),and(user_a.eq.${targetId},user_b.eq.${userId})`
    )
    .maybeSingle();

  return { matched: !!m };
}
