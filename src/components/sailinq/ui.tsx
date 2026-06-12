import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SailinqColors, SailinqRadius } from '@/constants/sailinq';

/** Ekran z gradientowym tłem navy i bezpiecznymi marginesami. */
export function Screen({ children, edges }: { children: ReactNode; edges?: ('top' | 'bottom')[] }) {
  return (
    <LinearGradient
      colors={[SailinqColors.bgGradientTop, SailinqColors.bg, SailinqColors.bgGradientBottom]}
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={edges ?? ['top']}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

/** Nagłówek ekranu: tytuł po lewej, opcjonalna akcja po prawej. */
export function Header({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {right}
    </View>
  );
}

/** Mały tag/chip (np. "Cruising", "POCZĄTKUJĄCY OK"). */
export function Tag({ label, tone = 'default' }: { label: string; tone?: 'default' | 'mint' | 'gold' }) {
  const toneStyle =
    tone === 'mint'
      ? { backgroundColor: 'rgba(87,224,198,0.15)', color: SailinqColors.mint }
      : tone === 'gold'
        ? { backgroundColor: 'rgba(230,169,62,0.15)', color: SailinqColors.gold }
        : { backgroundColor: SailinqColors.surfaceAlt, color: SailinqColors.textMuted };
  return (
    <View style={[styles.tag, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.tagText, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

/** Odznaka "Verified Skipper" ze złotym akcentem. */
export function VerifiedBadge({ label = 'Verified Skipper' }: { label?: string }) {
  return (
    <View style={styles.verified}>
      <Ionicons name="shield-checkmark" size={13} color={SailinqColors.gold} />
      <Text style={styles.verifiedText}>{label}</Text>
    </View>
  );
}

/** Kafelek statystyki: duża liczba + podpis (mile, rejsy, ocena). */
export function StatBox({
  value,
  label,
  sub,
  style,
}: {
  value: string;
  label: string;
  sub?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.statBox, style]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    color: SailinqColors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SailinqRadius.pill,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(230,169,62,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SailinqRadius.pill,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: SailinqColors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  statBox: {
    flex: 1,
    backgroundColor: SailinqColors.surfaceAlt,
    borderRadius: SailinqRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    color: SailinqColors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: SailinqColors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  statSub: {
    color: SailinqColors.mint,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
});
