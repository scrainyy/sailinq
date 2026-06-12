import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { getMyProfile, updateProfile } from '@/lib/profile';
import { pickAndUploadAvatar } from '@/lib/upload';

const ROLES = [
  { key: 'crew', label: 'Załoga' },
  { key: 'skipper', label: 'Kapitan' },
  { key: 'both', label: 'Oboje' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState('crew');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState(''); // tło (cover)
  const [avatar, setAvatar] = useState(''); // okrągłe profilowe
  const [miles, setMiles] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    getMyProfile().then((res) => {
      if (res.profile) {
        const p = res.profile;
        setName(p.name === 'Żeglarz' ? '' : p.name);
        setAge(p.age ? String(p.age) : '');
        setRole(p.role);
        setLocation(p.location);
        setBio(p.bio);
        setPhoto(p.photo);
        setAvatar(p.avatar);
        setMiles(p.miles ? String(p.miles) : '');
        setTags(p.tags.join(', '));
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Podaj imię.');
      return;
    }
    setBusy(true);
    const res = await updateProfile({
      name: name.trim(),
      age: age ? parseInt(age, 10) : null,
      role,
      location: location.trim(),
      bio: bio.trim(),
      photo: photo.trim(),
      avatar: avatar.trim(),
      miles: miles ? parseInt(miles, 10) : 0,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setBusy(false);
    if (res.error) setError(res.error);
    else router.back();
  };

  const pick = async (target: 'avatar' | 'cover') => {
    setError(null);
    setUploading(target);
    const res = await pickAndUploadAvatar();
    setUploading(null);
    if (res.error) setError(res.error);
    else if (res.url) (target === 'avatar' ? setAvatar : setPhoto)(res.url);
  };

  if (loading) {
    return (
      <View style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={SailinqColors.mint} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={SailinqColors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Edytuj profil</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/* Zdjęcie w tle (cover) + okrągłe profilowe (jak Instagram) */}
          <Text style={styles.fieldLabel}>Zdjęcie w tle i profilowe</Text>
          <View style={styles.coverArea}>
            <Pressable style={styles.coverClip} onPress={() => pick('cover')} disabled={!!uploading}>
              {photo ? (
                <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.coverEmpty]} />
              )}
              <View style={styles.coverBadge}>
                {uploading === 'cover' ? (
                  <ActivityIndicator size="small" color={SailinqColors.text} />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={15} color={SailinqColors.text} />
                    <Text style={styles.coverBadgeText}>{photo ? 'Zmień tło' : 'Dodaj tło'}</Text>
                  </>
                )}
              </View>
            </Pressable>

            <Pressable style={styles.avatarOnCover} onPress={() => pick('avatar')} disabled={!!uploading}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <View style={[styles.avatarImg, styles.avatarEmpty]}>
                  <Ionicons name="person" size={32} color={SailinqColors.textMuted} />
                </View>
              )}
              <View style={styles.avatarBadge}>
                {uploading === 'avatar' ? (
                  <ActivityIndicator size="small" color={SailinqColors.mintDark} />
                ) : (
                  <Ionicons name="camera" size={15} color={SailinqColors.mintDark} />
                )}
              </View>
            </Pressable>
          </View>
          <Text style={styles.coverHint}>Kliknij kółko, aby zmienić zdjęcie profilowe.</Text>

          <Field label="Imię *" placeholder="Adrian" value={name} onChangeText={setName} icon="person-outline" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Wiek" placeholder="28" value={age} onChangeText={setAge} keyboardType="number-pad" icon="calendar-outline" />
            </View>
            <View style={{ flex: 2 }}>
              <Field label="Lokalizacja" placeholder="Gdynia, Polska" value={location} onChangeText={setLocation} icon="location-outline" />
            </View>
          </View>

          {/* Rola */}
          <Text style={styles.fieldLabel}>Rola na pokładzie</Text>
          <View style={styles.roles}>
            {ROLES.map((r) => (
              <Pressable
                key={r.key}
                style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
                onPress={() => setRole(r.key)}>
                <Text style={[styles.roleText, role === r.key && styles.roleTextActive]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          <Field label="O mnie" placeholder="Kilka zdań o sobie jako żeglarzu…" value={bio} onChangeText={setBio} icon="document-text-outline" multiline />
          <Field label="Przebyte mile morskie" placeholder="980" value={miles} onChangeText={setMiles} keyboardType="number-pad" icon="navigate-outline" />
          <Field label="Tagi (oddziel przecinkami)" placeholder="Bałtyk, Cruising, Regaty" value={tags} onChangeText={setTags} icon="pricetags-outline" />

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.save} onPress={save} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={SailinqColors.mintDark} />
            ) : (
              <Text style={styles.saveText}>Zapisz profil</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  icon,
  multiline,
  ...props
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, multiline && styles.inputWrapMulti]}>
        {icon && <Ionicons name={icon} size={18} color={SailinqColors.textMuted} />}
        <TextInput
          placeholderTextColor={SailinqColors.textFaint}
          style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
          multiline={multiline}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SailinqColors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { color: SailinqColors.text, fontSize: 18, fontWeight: '800' },
  body: { padding: 20, paddingBottom: 40 },
  coverArea: { position: 'relative', marginBottom: 50, marginTop: 4 },
  coverClip: {
    height: 140,
    borderRadius: SailinqRadius.md,
    overflow: 'hidden',
    backgroundColor: SailinqColors.surface,
  },
  coverEmpty: { backgroundColor: SailinqColors.surfaceAlt },
  coverBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10,26,44,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  coverBadgeText: { color: SailinqColors.text, fontSize: 12, fontWeight: '700' },
  avatarOnCover: { position: 'absolute', bottom: -36, left: 16, width: 88, height: 88 },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: SailinqColors.surfaceAlt,
    borderWidth: 4,
    borderColor: SailinqColors.bg,
  },
  avatarEmpty: { alignItems: 'center', justifyContent: 'center' },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: SailinqColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: SailinqColors.bg,
  },
  coverHint: { color: SailinqColors.textFaint, fontSize: 12, marginTop: 6, marginBottom: 6 },
  field: { marginBottom: 12 },
  fieldLabel: { color: SailinqColors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 7, marginTop: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: SailinqColors.surface,
    borderRadius: SailinqRadius.sm,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputWrapMulti: { alignItems: 'flex-start', paddingVertical: 12 },
  input: { flex: 1, color: SailinqColors.text, fontSize: 15 },
  row: { flexDirection: 'row', gap: 12 },
  roles: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: SailinqRadius.sm,
    backgroundColor: SailinqColors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SailinqColors.border,
  },
  roleBtnActive: { backgroundColor: SailinqColors.mint, borderColor: SailinqColors.mint },
  roleText: { color: SailinqColors.textMuted, fontWeight: '700', fontSize: 14 },
  roleTextActive: { color: SailinqColors.mintDark },
  hint: { color: SailinqColors.textFaint, fontSize: 12, marginTop: -6, marginBottom: 8, lineHeight: 17 },
  error: { color: SailinqColors.nope, fontSize: 14, marginTop: 12 },
  footer: { padding: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: SailinqColors.border },
  save: {
    backgroundColor: SailinqColors.mint,
    borderRadius: SailinqRadius.pill,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: SailinqColors.mintDark, fontSize: 16, fontWeight: '800' },
});
