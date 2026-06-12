import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { listApplicants, respondToApplicant, type Applicant } from '@/lib/participants';

export default function ManageTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const res = await listApplicants(id);
    setApplicants(res.applicants);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (participantId: string, accept: boolean) => {
    setBusyId(participantId);
    await respondToApplicant(participantId, accept);
    await load();
    setBusyId(null);
  };

  const pending = applicants.filter((a) => a.status === 'pending');
  const accepted = applicants.filter((a) => a.status === 'accepted');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={26} color={SailinqColors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Zgłoszenia na rejs</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={SailinqColors.mint} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <SectionTitle text={`Oczekujące (${pending.length})`} />
          {pending.length === 0 ? (
            <Text style={styles.none}>Brak nowych zgłoszeń.</Text>
          ) : (
            pending.map((a) => (
              <ApplicantRow key={a.id} a={a} busy={busyId === a.id} onRespond={respond} showActions />
            ))
          )}

          <SectionTitle text={`Na pokładzie (${accepted.length})`} />
          {accepted.length === 0 ? (
            <Text style={styles.none}>Nikt jeszcze nie dołączył.</Text>
          ) : (
            accepted.map((a) => <ApplicantRow key={a.id} a={a} busy={false} onRespond={respond} />)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SectionTitle({ text }: { text: string }) {
  return <Text style={styles.section}>{text.toUpperCase()}</Text>;
}

function ApplicantRow({
  a,
  busy,
  onRespond,
  showActions,
}: {
  a: Applicant;
  busy: boolean;
  onRespond: (id: string, accept: boolean) => void;
  showActions?: boolean;
}) {
  return (
    <View style={styles.row}>
      {a.avatar ? (
        <Image source={{ uri: a.avatar }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarEmpty]}>
          <Text style={styles.avatarInitial}>{a.name[0]?.toUpperCase()}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{a.name}</Text>
        <Text style={styles.meta}>
          {[a.roleLabel, a.location, `${a.miles} NM`].filter(Boolean).join(' · ')}
        </Text>
      </View>

      {busy ? (
        <ActivityIndicator color={SailinqColors.mint} />
      ) : showActions ? (
        <View style={styles.actions}>
          <Pressable style={[styles.actBtn, styles.reject]} onPress={() => onRespond(a.id, false)}>
            <Ionicons name="close" size={20} color={SailinqColors.nope} />
          </Pressable>
          <Pressable style={[styles.actBtn, styles.accept]} onPress={() => onRespond(a.id, true)}>
            <Ionicons name="checkmark" size={20} color={SailinqColors.mintDark} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.onboard}>
          <Ionicons name="checkmark-circle" size={16} color={SailinqColors.mint} />
          <Text style={styles.onboardText}>Na pokładzie</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SailinqColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: { color: SailinqColors.text, fontSize: 18, fontWeight: '800' },
  body: { padding: 16, paddingBottom: 40 },
  section: {
    color: SailinqColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
  },
  none: { color: SailinqColors.textFaint, fontSize: 14, paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SailinqColors.surface,
    padding: 12,
    borderRadius: SailinqRadius.md,
    marginBottom: 10,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: SailinqColors.surfaceAlt },
  avatarEmpty: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: SailinqColors.mint, fontSize: 20, fontWeight: '800' },
  name: { color: SailinqColors.text, fontSize: 15, fontWeight: '700' },
  meta: { color: SailinqColors.textMuted, fontSize: 13, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  reject: { backgroundColor: 'rgba(255,107,107,0.15)' },
  accept: { backgroundColor: SailinqColors.mint },
  onboard: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onboardText: { color: SailinqColors.mint, fontSize: 12, fontWeight: '700' },
});
