import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Tag } from '@/components/sailinq/ui';
import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { applyToTrip, getMyParticipation, type ParticipationStatus } from '@/lib/participants';
import { getTrip, type TripView } from '@/lib/trips';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripView | null>(null);
  const [loading, setLoading] = useState(true);
  const [myStatus, setMyStatus] = useState<ParticipationStatus>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await getTrip(id);
      setTrip(res.trip ?? null);
      if (res.trip && !res.trip.isMine) {
        setMyStatus(await getMyParticipation(id));
      }
      setLoading(false);
    })();
  }, [id]);

  const apply = async () => {
    if (!id) return;
    setApplying(true);
    const res = await applyToTrip(id);
    setApplying(false);
    if (!res.error) setMyStatus('pending');
  };

  if (loading) {
    return (
      <View style={[styles.safe, styles.center]}>
        <ActivityIndicator color={SailinqColors.mint} size="large" />
      </View>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={styles.notFound}>Nie znaleziono rejsu.</Text>
        <Pressable onPress={() => router.back()} style={styles.backInline}>
          <Text style={styles.backInlineText}>Wróć</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const free = trip.berthsTotal - trip.berthsTaken;
  const full = free <= 0;

  return (
    <View style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.hero}>
          <Image source={{ uri: trip.photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(10,26,44,0.4)', 'rgba(10,26,44,0.2)', 'rgba(10,26,44,0.95)']}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView edges={['top']}>
            <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color={SailinqColors.text} />
            </Pressable>
          </SafeAreaView>
          <View style={styles.heroBottom}>
            <View style={styles.berthBadge}>
              <Ionicons name="bed-outline" size={13} color={SailinqColors.text} />
              <Text style={styles.berthText}>
                {full ? 'Brak miejsc' : `${free} wolne z ${trip.berthsTotal} koi`}
              </Text>
            </View>
            <Text style={styles.route}>{trip.route}</Text>
            <Text style={styles.meta}>{[trip.dates, trip.boat].filter(Boolean).join(' · ')}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Koszt udziału</Text>
              <Text style={styles.price}>{trip.price || '—'}</Text>
            </View>
            {trip.level ? <Tag label={trip.level} tone="mint" /> : null}
          </View>

          {trip.skipperName ? (
            <Section title="Sternik">
              <View style={styles.skipper}>
                <View style={styles.skipperIcon}>
                  <Ionicons name="shield-checkmark" size={20} color={SailinqColors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.skipperName}>{trip.skipperName}</Text>
                  <Text style={styles.skipperCert}>{trip.skipperCert}</Text>
                </View>
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedPillText}>Patent</Text>
                </View>
              </View>
            </Section>
          ) : null}

          {trip.description ? (
            <Section title="O rejsie">
              <Text style={styles.desc}>{trip.description}</Text>
            </Section>
          ) : null}

          {trip.included.length > 0 && (
            <Section title="W cenie">
              {trip.included.map((item) => (
                <View key={item} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={18} color={SailinqColors.mint} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </Section>
          )}

          {trip.requirements.length > 0 && (
            <Section title="Wymagania dla załogi">
              {trip.requirements.map((item) => (
                <View key={item} style={styles.listItem}>
                  <Ionicons name="ellipse" size={7} color={SailinqColors.textMuted} style={{ marginLeft: 5, marginRight: 6 }} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </Section>
          )}

          <Section title={`Załoga (${trip.berthsTaken}/${trip.berthsTotal})`}>
            <View style={styles.crew}>
              {Array.from({ length: trip.berthsTaken }).map((_, i) => (
                <View key={`taken-${i}`} style={styles.crewMember}>
                  <View style={styles.crewTaken}>
                    <Ionicons name="person" size={20} color={SailinqColors.mint} />
                  </View>
                  <Text style={styles.crewName}>zajęte</Text>
                </View>
              ))}
              {Array.from({ length: Math.max(0, free) }).map((_, i) => (
                <View key={`free-${i}`} style={styles.crewMember}>
                  <View style={styles.crewEmpty}>
                    <Ionicons name="add" size={20} color={SailinqColors.textMuted} />
                  </View>
                  <Text style={styles.crewName}>wolne</Text>
                </View>
              ))}
            </View>
          </Section>

          <Text style={styles.host}>Organizator: {trip.host}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <SafeAreaView edges={['bottom']}>
          {trip.isMine ? (
            <Pressable
              style={styles.applyBtn}
              onPress={() => router.push({ pathname: '/manage-trip', params: { id } })}>
              <Ionicons name="people-outline" size={18} color={SailinqColors.mintDark} />
              <Text style={[styles.applyText, { marginLeft: 6 }]}>Zarządzaj zgłoszeniami</Text>
            </Pressable>
          ) : myStatus === 'accepted' ? (
            <View style={[styles.applyBtn, styles.applyBtnDisabled]}>
              <Ionicons name="boat" size={16} color={SailinqColors.mint} />
              <Text style={[styles.applyText, { color: SailinqColors.mint, marginLeft: 6 }]}>
                Jesteś na pokładzie ⚓
              </Text>
            </View>
          ) : myStatus === 'pending' ? (
            <View style={[styles.applyBtn, styles.applyBtnDisabled]}>
              <Text style={[styles.applyText, { color: SailinqColors.textMuted }]}>
                Zgłoszenie wysłane — czeka na akceptację
              </Text>
            </View>
          ) : myStatus === 'rejected' ? (
            <View style={[styles.applyBtn, styles.applyBtnDisabled]}>
              <Text style={[styles.applyText, { color: SailinqColors.textMuted }]}>
                Zgłoszenie odrzucone
              </Text>
            </View>
          ) : full ? (
            <View style={[styles.applyBtn, styles.applyBtnDisabled]}>
              <Text style={[styles.applyText, { color: SailinqColors.textMuted }]}>Brak wolnych koi</Text>
            </View>
          ) : (
            <Pressable style={styles.applyBtn} onPress={apply} disabled={applying}>
              {applying ? (
                <ActivityIndicator color={SailinqColors.mintDark} />
              ) : (
                <Text style={styles.applyText}>Aplikuj na rejs</Text>
              )}
            </Pressable>
          )}
        </SafeAreaView>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SailinqColors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  notFound: { color: SailinqColors.text, fontSize: 16 },
  backInline: { marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: SailinqColors.surface, borderRadius: 999 },
  backInlineText: { color: SailinqColors.mint, fontWeight: '700' },
  hero: { height: 300 },
  backBtn: {
    margin: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10,26,44,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, gap: 6 },
  berthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10,26,44,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  berthText: { color: SailinqColors.text, fontSize: 12, fontWeight: '700' },
  route: { color: SailinqColors.text, fontSize: 26, fontWeight: '800' },
  meta: { color: SailinqColors.textMuted, fontSize: 15 },
  body: { padding: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceLabel: { color: SailinqColors.textMuted, fontSize: 12, fontWeight: '600' },
  price: { color: SailinqColors.mint, fontSize: 22, fontWeight: '800', marginTop: 2 },
  section: { marginTop: 26 },
  sectionTitle: { color: SailinqColors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 12 },
  skipper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: SailinqColors.surface,
    padding: 14,
    borderRadius: SailinqRadius.md,
  },
  skipperIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(230,169,62,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipperName: { color: SailinqColors.text, fontSize: 15, fontWeight: '700' },
  skipperCert: { color: SailinqColors.textMuted, fontSize: 13, marginTop: 2 },
  verifiedPill: { backgroundColor: 'rgba(87,224,198,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  verifiedPillText: { color: SailinqColors.mint, fontSize: 11, fontWeight: '700' },
  desc: { color: SailinqColors.text, fontSize: 15, lineHeight: 23 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  listText: { color: SailinqColors.text, fontSize: 15, flex: 1 },
  crew: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  crewMember: { alignItems: 'center', gap: 6, width: 64 },
  crewTaken: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SailinqColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewEmpty: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SailinqColors.surface,
    borderWidth: 1.5,
    borderColor: SailinqColors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewName: { color: SailinqColors.textMuted, fontSize: 12 },
  host: { color: SailinqColors.textMuted, fontSize: 13, marginTop: 24 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SailinqColors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SailinqColors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  applyBtn: {
    backgroundColor: SailinqColors.mint,
    borderRadius: SailinqRadius.pill,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: { backgroundColor: SailinqColors.surfaceAlt },
  applyText: { color: SailinqColors.mintDark, fontSize: 16, fontWeight: '800' },
});
