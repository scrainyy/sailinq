import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

type UploadResult = { url?: string; error?: string; canceled?: boolean };

/**
 * Otwiera galerię, pozwala wybrać i przyciąć zdjęcie (kwadrat),
 * wysyła je do Supabase Storage (bucket 'avatars') i zwraca publiczny link.
 */
export async function pickAndUploadAvatar(): Promise<UploadResult> {
  // 1) Poproś o dostęp do galerii
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    return { error: 'Brak dostępu do galerii — włącz go w ustawieniach telefonu.' };
  }

  // 2) Wybór zdjęcia (przycięcie do kwadratu, kompresja)
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.6,
    base64: true,
  });
  if (result.canceled) return { canceled: true };

  const asset = result.assets[0];
  if (!asset?.base64) return { error: 'Nie udało się odczytać zdjęcia.' };

  // 3) Kto wysyła (ścieżka pliku zaczyna się od jego id — wymóg zabezpieczeń)
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { error: 'Nie jesteś zalogowany.' };

  const ext = (asset.uri.split('.').pop() || 'jpg').toLowerCase();
  const contentType = asset.mimeType ?? `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const path = `${userId}/${Date.now()}.${ext}`;

  // 4) Wyślij (base64 → ArrayBuffer)
  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, decode(asset.base64), { contentType, upsert: true });
  if (upErr) return { error: upErr.message };

  // 5) Publiczny link
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { url: data.publicUrl };
}
