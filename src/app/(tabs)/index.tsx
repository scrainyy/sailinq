import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { SwipeCard } from '@/components/sailinq/SwipeCard';
import { Header, Screen } from '@/components/sailinq/ui';
import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { listDiscoverProfiles, recordSwipe, type DiscoverFilters, type DiscoverProfile } from '@/lib/discover';
import { getMyProfile } from '@/lib/profile';

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matched, setMatched] = useState<DiscoverProfile | null>(null);
  const [myAvatar, setMyAvatar] = useState('');
  const [filters, setFilters] = useState<DiscoverFilters>({ role: '', onlyVerified: false, location: '' });
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async (f: DiscoverFilters) => {
    setLoading(true);
    const [disc, me] = await Promise.all([listDiscoverProfiles(f), getMyProfile()]);
    setProfiles(disc.profiles);
    setIndex(0);
    setMyAvatar(me.profile?.avatar ?? '');
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(filters);
    }, [load, filters])
  );

  const activeFilterCount =
    (filters.role ? 1 : 0) + (filters.onlyVerified ? 1 : 0) + (filters.location ? 1 : 0);

  const applyFilters = (f: DiscoverFilters) => {
    setShowFilters(false);
    setFilters(f);
  };

  const handleSwiped = useCallback(async (profile: DiscoverProfile, dir: 'left' | 'right') => {
    setIndex((i) => i + 1);
    const res = await recordSwipe(profile.id, dir === 'right');
    if (res.matched) setMatched(profile);
  }, []);

  const top = profiles[index];
  const done = !loading && index >= profiles.length;

  // Karty od dołu do góry: ostatnia w tablicy renderuje się na wierzchu.
  const deck = profiles.slice(index, index + 2).reverse();

  return (
    <Screen>
      <Header
        title="Discover"
        right={
          <Pressable style={styles.filterBtn} onPress={() => setShowFilters(true)}>
            <Ionicons name="options-outline" size={18} color={SailinqColors.text} />
            <Text style={styles.filterText}>Filtry</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        }
      />

      <View style={styles.deck}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={SailinqColors.mint} size="large" />
          </View>
        ) : done ? (
          <View style={styles.empty}>
            <Ionicons name="compass-outline" size={56} color={SailinqColors.textMuted} />
            <Text style={styles.emptyTitle}>To na razie wszyscy w pobliżu</Text>
            <Text style={styles.emptySub}>
              {activeFilterCount > 0 ? 'Spróbuj poluzować filtry.' : 'Wróć później albo odśwież — pływamy dalej.'}
            </Text>
            <Pressable style={styles.resetBtn} onPress={() => load(filters)}>
              <Text style={styles.resetText}>Odśwież</Text>
            </Pressable>
          </View>
        ) : (
          deck.map((profile) => (
            <SwipeCard
              key={profile.id}
              sailor={profile}
              isTop={profile.id === top?.id}
              onSwiped={(dir) => handleSwiped(profile, dir)}
            />
          ))
        )}
      </View>

      {!loading && !done && top && (
        <View style={styles.actions}>
          <ActionButton icon="close" color={SailinqColors.nope} size={28} onPress={() => handleSwiped(top, 'left')} />
          <ActionButton icon="star" color={SailinqColors.gold} size={22} small onPress={() => handleSwiped(top, 'right')} />
          <ActionButton icon="heart" color={SailinqColors.mint} size={26} onPress={() => handleSwiped(top, 'right')} />
        </View>
      )}

      {matched && (
        <MatchOverlay profile={matched} myAvatar={myAvatar} onClose={() => setMatched(null)} />
      )}

      {showFilters && (
        <FilterSheet initial={filters} onApply={applyFilters} onClose={() => setShowFilters(false)} />
      )}
    </Screen>
  );
}

const ROLE_OPTIONS = [
  { key: '', label: 'Dowolna' },
  { key: 'skipper', label: 'Kapitan' },
  { key: 'crew', label: 'Załoga' },
  { key: 'both', label: 'Oboje' },
];

function FilterSheet({
  initial,
  onApply,
  onClose,
}: {
  initial: DiscoverFilters;
  onApply: (f: DiscoverFilters) => void;
  onClose: () => void;
}) {
  const [role, setRole] = useState(initial.role ?? '');
  const [onlyVerified, setOnlyVerified] = useState(initial.onlyVerified ?? false);
  const [location, setLocation] = useState(initial.location ?? '');

  return (
    <View style={styles.sheetWrap}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Filtry</Text>

        <Text style={styles.sheetLabel}>Rola</Text>
        <View style={styles.sheetChips}>
          {ROLE_OPTIONS.map((r) => (
            <Pressable
              key={r.key}
              style={[styles.sheetChip, role === r.key && styles.sheetChipActive]}
              onPress={() => setRole(r.key)}>
              <Text style={[styles.sheetChipText, role === r.key && styles.sheetChipTextActive]}>
                {r.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sheetLabel}>Lokalizacja</Text>
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="np. Gdynia, Chorwacja…"
          placeholderTextColor={SailinqColors.textFaint}
          style={styles.sheetInput}
          autoCapitalize="none"
        />

        <View style={styles.sheetSwitch}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetSwitchTitle}>Tylko zweryfikowani</Text>
            <Text style={styles.sheetSwitchSub}>Żeglarze z potwierdzonym profilem</Text>
          </View>
          <Switch
            value={onlyVerified}
            onValueChange={setOnlyVerified}
            trackColor={{ false: SailinqColors.surfaceAlt, true: SailinqColors.mint }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.sheetActions}>
          <Pressable
            style={styles.sheetReset}
            onPress={() => {
              setRole('');
              setOnlyVerified(false);
              setLocation('');
            }}>
            <Text style={styles.sheetResetText}>Wyczyść</Text>
          </Pressable>
          <Pressable
            style={styles.sheetApply}
            onPress={() => onApply({ role, onlyVerified, location: location.trim() })}>
            <Text style={styles.sheetApplyText}>Pokaż wyniki</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function MatchOverlay({
  profile,
  myAvatar,
  onClose,
}: {
  profile: DiscoverProfile;
  myAvatar: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.matchTitle}>To match! ⚓</Text>
      <Text style={styles.matchSub}>Ty i {profile.name} polubiliście się nawzajem.</Text>

      <View style={styles.matchAvatars}>
        <Avatar uri={myAvatar} fallback="Ty" />
        <View style={styles.matchHeart}>
          <Ionicons name="heart" size={26} color={SailinqColors.mint} />
        </View>
        <Avatar uri={profile.photo} fallback={profile.name[0]} />
      </View>

      <Pressable style={styles.matchPrimary} onPress={onClose}>
        <Text style={styles.matchPrimaryText}>Przeglądaj dalej</Text>
      </Pressable>
      <Text style={styles.matchNote}>Rozmowę z matchami podłączymy w zakładce Chat.</Text>
    </View>
  );
}

function Avatar({ uri, fallback }: { uri: string; fallback: string }) {
  return uri ? (
    <Image source={{ uri }} style={styles.matchAvatar} contentFit="cover" />
  ) : (
    <View style={[styles.matchAvatar, styles.matchAvatarEmpty]}>
      <Text style={styles.matchAvatarInitial}>{fallback[0]?.toUpperCase()}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  color,
  size,
  small,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  small?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.actionBtn, small && styles.actionBtnSmall, { borderColor: color }]}>
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SailinqColors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterText: { color: SailinqColors.text, fontSize: 13, fontWeight: '600' },
  filterCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: SailinqColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterCountText: { color: SailinqColors.mintDark, fontSize: 11, fontWeight: '800' },
  deck: { flex: 1, marginHorizontal: 16, marginTop: 4, marginBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 22, paddingVertical: 14 },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: SailinqColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSmall: { width: 50, height: 50, borderRadius: 25 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyTitle: { color: SailinqColors.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySub: { color: SailinqColors.textMuted, fontSize: 14, textAlign: 'center' },
  resetBtn: { marginTop: 12, backgroundColor: SailinqColors.mint, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999 },
  resetText: { color: SailinqColors.mintDark, fontWeight: '700' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,21,34,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 14,
  },
  matchTitle: { color: SailinqColors.mint, fontSize: 34, fontWeight: '900' },
  matchSub: { color: SailinqColors.text, fontSize: 16, textAlign: 'center' },
  matchAvatars: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 18 },
  matchAvatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: SailinqColors.mint, backgroundColor: SailinqColors.surfaceAlt },
  matchAvatarEmpty: { alignItems: 'center', justifyContent: 'center' },
  matchAvatarInitial: { color: SailinqColors.mint, fontSize: 36, fontWeight: '800' },
  matchHeart: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SailinqColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchPrimary: {
    marginTop: 8,
    backgroundColor: SailinqColors.mint,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: SailinqRadius.pill,
  },
  matchPrimaryText: { color: SailinqColors.mintDark, fontSize: 16, fontWeight: '800' },
  matchNote: { color: SailinqColors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },

  sheetWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,21,34,0.7)' },
  sheet: {
    backgroundColor: SailinqColors.surfaceMuted,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 6,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: SailinqColors.borderStrong,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: { color: SailinqColors.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
  sheetLabel: { color: SailinqColors.textMuted, fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  sheetChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: SailinqColors.surface,
    borderWidth: 1,
    borderColor: SailinqColors.border,
  },
  sheetChipActive: { backgroundColor: SailinqColors.mint, borderColor: SailinqColors.mint },
  sheetChipText: { color: SailinqColors.textMuted, fontSize: 14, fontWeight: '700' },
  sheetChipTextActive: { color: SailinqColors.mintDark },
  sheetInput: {
    backgroundColor: SailinqColors.surface,
    borderRadius: SailinqRadius.sm,
    paddingHorizontal: 14,
    height: 50,
    color: SailinqColors.text,
    fontSize: 15,
  },
  sheetSwitch: { flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 12 },
  sheetSwitchTitle: { color: SailinqColors.text, fontSize: 15, fontWeight: '700' },
  sheetSwitchSub: { color: SailinqColors.textMuted, fontSize: 13, marginTop: 2 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  sheetReset: {
    flex: 1,
    height: 52,
    borderRadius: SailinqRadius.pill,
    borderWidth: 1,
    borderColor: SailinqColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetResetText: { color: SailinqColors.text, fontSize: 15, fontWeight: '700' },
  sheetApply: {
    flex: 2,
    height: 52,
    borderRadius: SailinqRadius.pill,
    backgroundColor: SailinqColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetApplyText: { color: SailinqColors.mintDark, fontSize: 15, fontWeight: '800' },
});
