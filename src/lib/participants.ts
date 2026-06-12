import { roleLabel } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

export type ParticipationStatus = 'pending' | 'accepted' | 'rejected' | null;

export type Applicant = {
  id: string; // id wiersza trip_participants
  status: 'pending' | 'accepted' | 'rejected';
  name: string;
  avatar: string;
  roleLabel: string;
  location: string;
  miles: number;
};

/** Zgłoś się na rejs (status: oczekujące). */
export async function applyToTrip(tripId: string): Promise<{ error?: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: 'Nie jesteś zalogowany.' };

  const { error } = await supabase
    .from('trip_participants')
    .upsert({ trip_id: tripId, profile_id: userId, status: 'pending' }, { onConflict: 'trip_id,profile_id' });
  return { error: error?.message };
}

/** Mój status na danym rejsie. */
export async function getMyParticipation(tripId: string): Promise<ParticipationStatus> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return null;

  const { data } = await supabase
    .from('trip_participants')
    .select('status')
    .eq('trip_id', tripId)
    .eq('profile_id', userId)
    .maybeSingle();
  return (data?.status as ParticipationStatus) ?? null;
}

/** Lista zgłoszeń na rejs (dla organizatora). */
export async function listApplicants(tripId: string): Promise<{ applicants: Applicant[]; error?: string }> {
  const { data, error } = await supabase
    .from('trip_participants')
    .select('id, status, created_at, profile:profiles!profile_id(name, avatar, role, location, miles)')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (error) return { applicants: [], error: error.message };

  const applicants = (data as any[]).map((r) => ({
    id: r.id,
    status: r.status,
    name: r.profile?.name ?? 'Żeglarz',
    avatar: r.profile?.avatar ?? '',
    roleLabel: roleLabel(r.profile?.role ?? 'crew'),
    location: r.profile?.location ?? '',
    miles: r.profile?.miles ?? 0,
  }));
  return { applicants };
}

/** Akceptuj lub odrzuć zgłoszenie (dla organizatora). */
export async function respondToApplicant(
  participantId: string,
  accept: boolean
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('trip_participants')
    .update({ status: accept ? 'accepted' : 'rejected' })
    .eq('id', participantId);
  return { error: error?.message };
}
