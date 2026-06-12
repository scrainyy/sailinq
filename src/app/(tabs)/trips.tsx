import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TripsMap } from '@/components/sailinq/TripsMap';
import { Header, Screen, Tag } from '@/components/sailinq/ui';
import { AKWENY } from '@/constants/akweny';
import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { listTrips, type TripView } from '@/lib/trips';

export default function TripsScreen() {
  const router = useRouter();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [akwen, setAkwen] = useState<string>(''); // '' = wszystkie
  const [trips, setTrips] = useState<TripView[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await listTrips();
    if (res.error) setError(res.error);
    else {
      setError(null);
      setTrips(res.trips);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  // Przeładuj za każdym wejściem na zakładkę (np. po utworzeniu rejsu).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = akwen ? trips.filter((t) => t.akwen === akwen) : trips;

  return (
    <Screen>
      <Header
        title="Trips"
        right={
          <View style={styles.toggle}>
            <ToggleBtn active={view === 'list'} icon="list" onPress={() => setView('list')} />
            <ToggleBtn active={view === 'map'} icon="map" onPress={() => setView('map')} />
          </View>
        }
      />

      {/* Filtr akwenów */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        <FilterChip label="Wszystkie" active={akwen === ''} onPress={() => setAkwen('')} />
        {AKWENY.map((a) => (
          <FilterChip key={a.key} label={a.label} active={akwen === a.key} onPress={() => setAkwen(a.key)} />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={SailinqColors.mint} size="large" />
        </View>
      ) : view === 'map' ? (
        filtered.length === 0 ? (
          <View style={styles.center}>
            <EmptyState />
          </View>
        ) : (
          <TripsMap trips={filtered} onSelect={(id) => router.push(`/trip/${id}`)} />
        )
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={SailinqColors.mint}
            />
          }>
          {error ? (
            <Text style={styles.error}>Błąd ładowania: {error}</Text>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((t) => <TripCard key={t.id} trip={t} />)
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </Screen>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.filterChip, active && styles.filterChipActive]} onPress={onPress}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function TripCard({ trip }: { trip: TripView }) {
  const router = useRouter();
  const full = trip.berthsTaken >= trip.berthsTotal;
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/trip/${trip.id}`)}>
      <View style={styles.cardImgWrap}>
        <Image source={{ uri: trip.photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient colors={['rgba(10,26,44,0.05)', 'rgba(10,26,44,0.7)']} style={StyleSheet.absoluteFill} />
        <View style={styles.berthBadge}>
          <Ionicons name="bed-outline" size={13} color={SailinqColors.text} />
          <Text style={styles.berthText}>
            {trip.berthsTaken}/{trip.berthsTotal} koi
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.route}>{trip.route}</Text>
        <Text style={styles.meta}>
          {[trip.dates, trip.boat, trip.price].filter(Boolean).join(' · ')}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.host}>
            {trip.hostAvatar ? (
              <Image source={{ uri: trip.hostAvatar }} style={styles.hostAvatar} contentFit="cover" />
            ) : (
              <View style={styles.hostAvatar}>
                <Text style={styles.hostInitial}>{trip.host[0]?.toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={styles.hostName}>{trip.host}</Text>
              <View style={styles.hostRatingRow}>
                <Ionicons name="star" size={11} color={SailinqColors.star} />
                <Text style={styles.hostRating}>
                  {trip.hostRating > 0 ? trip.hostRating : 'nowy'} · {trip.hostTrips} rejsów
                </Text>
              </View>
            </View>
          </View>

          {trip.isMine ? (
            <View style={styles.mineBadge}>
              <Ionicons name="star" size={12} color={SailinqColors.gold} />
              <Text style={styles.mineText}>Twój rejs</Text>
            </View>
          ) : (
            <Pressable style={[styles.joinBtn, full && styles.joinBtnFull]} onPress={() => router.push(`/trip/${trip.id}`)}>
              <Text style={[styles.joinText, full && { color: SailinqColors.textMuted }]}>
                {full ? 'Pełny' : 'Zgłoś się'}
              </Text>
            </Pressable>
          )}
        </View>

        {trip.level ? (
          <View style={{ marginTop: 10, flexDirection: 'row' }}>
            <Tag label={trip.level} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <View style={styles.empty}>
      <Ionicons name="boat-outline" size={56} color={SailinqColors.textMuted} />
      <Text style={styles.emptyTitle}>Brak rejsów</Text>
      <Text style={styles.emptySub}>Utwórz pierwszy rejs przyciskiem „+" na dole.</Text>
      <Pressable style={styles.emptyBtn} onPress={() => router.push('/create')}>
        <Text style={styles.emptyBtnText}>Utwórz rejs</Text>
      </Pressable>
    </View>
  );
}

function MapPlaceholder() {
  return (
    <View style={styles.map}>
      <Ionicons name="map-outline" size={56} color={SailinqColors.textMuted} />
      <Text style={styles.mapTitle}>Widok mapy</Text>
      <Text style={styles.mapSub}>
        Tu pojawi się interaktywna mapa (Mapbox) z pinezkami rejsów. Dodamy ją później.
      </Text>
    </View>
  );
}

function ToggleBtn({
  active,
  icon,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleBtn, active && styles.toggleBtnActive]}>
      <Ionicons name={icon} size={18} color={active ? SailinqColors.mintDark : SailinqColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', backgroundColor: SailinqColors.surfaceAlt, borderRadius: 999, padding: 3 },
  toggleBtn: { padding: 7, borderRadius: 999 },
  toggleBtnActive: { backgroundColor: SailinqColors.mint },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  regionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SailinqColors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  regionText: { color: SailinqColors.text, fontWeight: '700', fontSize: 13 },
  count: { color: SailinqColors.textMuted, fontSize: 13 },
  filterScroll: { maxHeight: 50, flexGrow: 0 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: SailinqColors.surface,
    borderWidth: 1,
    borderColor: SailinqColors.border,
  },
  filterChipActive: { backgroundColor: SailinqColors.mint, borderColor: SailinqColors.mint },
  filterChipText: { color: SailinqColors.textMuted, fontSize: 13, fontWeight: '700' },
  filterChipTextActive: { color: SailinqColors.mintDark },
  mineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(230,169,62,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  mineText: { color: SailinqColors.gold, fontWeight: '800', fontSize: 13 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, gap: 16, flexGrow: 1 },
  error: { color: SailinqColors.nope, textAlign: 'center', marginTop: 30 },
  card: {
    backgroundColor: SailinqColors.surface,
    borderRadius: SailinqRadius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SailinqColors.border,
  },
  cardImgWrap: { height: 130 },
  berthBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10,26,44,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  berthText: { color: SailinqColors.text, fontSize: 12, fontWeight: '700' },
  cardBody: { padding: 16 },
  route: { color: SailinqColors.text, fontSize: 18, fontWeight: '800' },
  meta: { color: SailinqColors.textMuted, fontSize: 13, marginTop: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  host: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SailinqColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostInitial: { color: SailinqColors.mint, fontWeight: '800', fontSize: 16 },
  hostName: { color: SailinqColors.text, fontWeight: '700', fontSize: 14 },
  hostRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  hostRating: { color: SailinqColors.textMuted, fontSize: 12 },
  joinBtn: { backgroundColor: SailinqColors.mint, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 },
  joinBtnFull: { backgroundColor: SailinqColors.surfaceAlt },
  joinText: { color: SailinqColors.mintDark, fontWeight: '800', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { color: SailinqColors.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySub: { color: SailinqColors.textMuted, fontSize: 14, textAlign: 'center' },
  emptyBtn: { marginTop: 14, backgroundColor: SailinqColors.mint, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  emptyBtnText: { color: SailinqColors.mintDark, fontWeight: '800' },
  map: {
    flex: 1,
    margin: 16,
    borderRadius: SailinqRadius.lg,
    backgroundColor: SailinqColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 40,
  },
  mapTitle: { color: SailinqColors.text, fontSize: 18, fontWeight: '700' },
  mapSub: { color: SailinqColors.textMuted, fontSize: 14, textAlign: 'center' },
});
