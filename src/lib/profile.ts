import { supabase } from '@/lib/supabase';

/** Profil użytkownika w kształcie gotowym dla UI. */
export type ProfileView = {
  id: string;
  name: string;
  age: number | null;
  role: string; // 'skipper' | 'crew' | 'both'
  location: string;
  bio: string;
  photo: string; // zdjęcie w tle (cover)
  avatar: string; // okrągłe zdjęcie profilowe
  miles: number;
  milesVerified: number;
  tripsCount: number;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  tags: string[];
};

/** Dane edytowalne przez użytkownika. */
export type ProfileEdit = {
  name: string;
  age: number | null;
  role: string;
  location: string;
  bio: string;
  photo: string;
  avatar: string;
  miles: number;
  tags: string[];
};

type ProfileRow = {
  id: string;
  name: string | null;
  age: number | null;
  role: string | null;
  location: string | null;
  bio: string | null;
  photo: string | null;
  avatar: string | null;
  miles: number | null;
  miles_verified: number | null;
  trips_count: number | null;
  rating: number | null;
  reviews_count: number | null;
  verified: boolean | null;
  tags: string[] | null;
};

function toView(row: ProfileRow): ProfileView {
  return {
    id: row.id,
    name: row.name ?? 'Żeglarz',
    age: row.age,
    role: row.role ?? 'crew',
    location: row.location ?? '',
    bio: row.bio ?? '',
    photo: row.photo ?? '',
    avatar: row.avatar ?? '',
    miles: row.miles ?? 0,
    milesVerified: row.miles_verified ?? 0,
    tripsCount: row.trips_count ?? 0,
    rating: row.rating ?? 0,
    reviewsCount: row.reviews_count ?? 0,
    verified: row.verified ?? false,
    tags: row.tags ?? [],
  };
}

/** Pobierz profil zalogowanego użytkownika. */
export async function getMyProfile(): Promise<{ profile?: ProfileView; error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: 'Nie jesteś zalogowany.' };

  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return { error: error.message };
  return { profile: toView(data as ProfileRow) };
}

/** Zapisz zmiany w profilu zalogowanego użytkownika. */
export async function updateProfile(input: ProfileEdit): Promise<{ error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: 'Nie jesteś zalogowany.' };

  const { error } = await supabase
    .from('profiles')
    .update({
      name: input.name,
      age: input.age,
      role: input.role,
      location: input.location,
      bio: input.bio,
      photo: input.photo,
      avatar: input.avatar,
      miles: input.miles,
      tags: input.tags,
    })
    .eq('id', userId);

  return { error: error?.message };
}

/** Czytelna nazwa roli po polsku. */
export function roleLabel(role: string): string {
  if (role === 'skipper') return 'Kapitan';
  if (role === 'both') return 'Kapitan / Załoga';
  return 'Załoga';
}
