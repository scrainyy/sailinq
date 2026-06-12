import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

import { AKWENY } from '@/constants/akweny';
import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { createTrip } from '@/lib/trips';

export default function CreateTripScreen() {
  const router = useRouter();

  const [route, setRoute] = useState('');
  const [akwen, setAkwen] = useState('');
  const [dates, setDates] = useState('');
  const [boat, setBoat] = useState('');
  const [berths, setBerths] = useState(6);
  const [price, setPrice] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [skipperName, setSkipperName] = useState('');
  const [skipperCert, setSkipperCert] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPublish = route.trim() && skipperName.trim() && skipperCert.trim();

  const publish = async () => {
    setError(null);
    if (!canPublish) {
      setError('Uzupełnij trasę oraz sternika z certyfikatem.');
      return;
    }
    setBusy(true);
    const res = await createTrip({
      route: route.trim(),
      akwen: akwen || undefined,
      dates: dates.trim(),
      boat: boat.trim(),
      price: price.trim(),
      berths_total: berths,
      level: level.trim(),
      description: description.trim(),
      skipper_name: skipperName.trim(),
      skipper_cert: skipperCert.trim(),
    });
    setBusy(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={SailinqColors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Nowy rejs</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.photoUpload}>
            <Ionicons name="camera-outline" size={28} color={SailinqColors.textMuted} />
            <Text style={styles.photoText}>Zdjęcia dodamy wkrótce — na razie damy domyślne</Text>
          </Pressable>

          <Field
            label="Trasa *"
            placeholder="Split → Kornati → Split"
            icon="navigate-outline"
            value={route}
            onChangeText={setRoute}
          />

          <Text style={styles.fieldLabel}>Akwen</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.akwenRow}
            keyboardShouldPersistTaps="handled">
            {AKWENY.map((a) => (
              <Pressable
                key={a.key}
                style={[styles.akwenChip, akwen === a.key && styles.akwenChipActive]}
                onPress={() => setAkwen(akwen === a.key ? '' : a.key)}>
                <Text style={[styles.akwenChipText, akwen === a.key && styles.akwenChipTextActive]}>
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Field
            label="Terminy"
            placeholder="12–19 lip"
            icon="calendar-outline"
            value={dates}
            onChangeText={setDates}
          />
          <Field label="Jacht" placeholder="Bavaria 46" icon="boat-outline" value={boat} onChangeText={setBoat} />

          <Text style={styles.fieldLabel}>Liczba koi (miejsc dla załogi)</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtn} onPress={() => setBerths((b) => Math.max(1, b - 1))}>
              <Ionicons name="remove" size={22} color={SailinqColors.text} />
            </Pressable>
            <Text style={styles.stepValue}>{berths}</Text>
            <Pressable style={styles.stepBtn} onPress={() => setBerths((b) => Math.min(12, b + 1))}>
              <Ionicons name="add" size={22} color={SailinqColors.text} />
            </Pressable>
          </View>

          <Field label="Koszt za koję" placeholder="€340 lub 'cost split'" icon="cash-outline" value={price} onChangeText={setPrice} />
          <Field label="Wymagany poziom" placeholder="Początkujący OK" icon="ribbon-outline" value={level} onChangeText={setLevel} />
          <Field
            label="Opis"
            placeholder="Kilka zdań o rejsie…"
            icon="document-text-outline"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Sternik z certyfikatem — wymagany */}
          <Text style={styles.sectionLabel}>Sternik z certyfikatem (wymagany)</Text>
          <Field label="Imię sternika *" placeholder="np. Oliver M." icon="person-outline" value={skipperName} onChangeText={setSkipperName} />
          <Field label="Certyfikat / patent *" placeholder="np. RYA Yachtmaster" icon="shield-checkmark-outline" value={skipperCert} onChangeText={setSkipperCert} />
          <Text style={styles.hint}>
            Każdy może zorganizować rejs, ale na pokładzie musi być ktoś z ważnym patentem.
          </Text>

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.publish, !canPublish && styles.publishDisabled]}
            disabled={!canPublish || busy}
            onPress={publish}>
            {busy ? (
              <ActivityIndicator color={SailinqColors.mintDark} />
            ) : (
              <Text style={[styles.publishText, !canPublish && { color: SailinqColors.textMuted }]}>
                Opublikuj rejs
              </Text>
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
  body: { padding: 20, gap: 4, paddingBottom: 40 },
  photoUpload: {
    height: 110,
    borderRadius: SailinqRadius.md,
    borderWidth: 1.5,
    borderColor: SailinqColors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  photoText: { color: SailinqColors.textMuted, fontSize: 13, textAlign: 'center' },
  field: { marginBottom: 12 },
  fieldLabel: { color: SailinqColors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 7, marginTop: 6 },
  sectionLabel: {
    color: SailinqColors.mint,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
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
  akwenRow: { gap: 8, paddingVertical: 2, paddingRight: 8, marginBottom: 6 },
  akwenChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: SailinqColors.surface,
    borderWidth: 1,
    borderColor: SailinqColors.border,
  },
  akwenChipActive: { backgroundColor: SailinqColors.mint, borderColor: SailinqColors.mint },
  akwenChipText: { color: SailinqColors.textMuted, fontSize: 13, fontWeight: '700' },
  akwenChipTextActive: { color: SailinqColors.mintDark },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SailinqColors.surface,
    borderRadius: SailinqRadius.sm,
    alignSelf: 'flex-start',
    gap: 20,
    padding: 6,
    marginBottom: 6,
  },
  stepBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: SailinqColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { color: SailinqColors.text, fontSize: 20, fontWeight: '800', minWidth: 28, textAlign: 'center' },
  hint: { color: SailinqColors.textFaint, fontSize: 12, marginTop: 8, lineHeight: 17 },
  error: { color: SailinqColors.nope, fontSize: 14, marginTop: 14 },
  footer: { padding: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: SailinqColors.border },
  publish: {
    backgroundColor: SailinqColors.mint,
    borderRadius: SailinqRadius.pill,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishDisabled: { backgroundColor: SailinqColors.surfaceAlt },
  publishText: { color: SailinqColors.mintDark, fontSize: 16, fontWeight: '800' },
});
