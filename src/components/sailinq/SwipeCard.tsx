import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import type { DiscoverProfile } from '@/lib/discover';
import { StatBox, Tag, VerifiedBadge } from './ui';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.28;

type Props = {
  sailor: DiscoverProfile;
  isTop: boolean;
  onSwiped: (dir: 'left' | 'right') => void;
};

export function SwipeCard({ sailor, isTop, onSwiped }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const dir = e.translationX > 0 ? 'right' : 'left';
        translateX.value = withSpring(Math.sign(e.translationX) * width * 1.5);
        runOnJS(onSwiped)(dir);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-width / 2, 0, width / 2], [-8, 0, 8]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1]),
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0]),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle, !isTop && styles.behind]}>
        {sailor.photo ? (
          <Image source={{ uri: sailor.photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.noPhoto]}>
            <Text style={styles.noPhotoInitial}>{sailor.name[0]?.toUpperCase()}</Text>
          </View>
        )}
        <LinearGradient
          colors={['rgba(10,26,44,0.1)', 'rgba(10,26,44,0.55)', 'rgba(10,26,44,0.96)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Górne odznaki */}
        <View style={styles.top}>
          {sailor.verified ? <VerifiedBadge /> : <View />}
          <View style={styles.locPill}>
            <Ionicons name="location-sharp" size={12} color={SailinqColors.text} />
            <Text style={styles.locText}>{sailor.location}</Text>
          </View>
        </View>

        {/* Stemple LIKE / NOPE */}
        <Animated.View style={[styles.stamp, styles.like, likeStyle]}>
          <Text style={[styles.stampText, { color: SailinqColors.like }]}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.nope, nopeStyle]}>
          <Text style={[styles.stampText, { color: SailinqColors.nope }]}>NOPE</Text>
        </Animated.View>

        {/* Dół karty */}
        <View style={styles.bottom}>
          <Text style={styles.name}>
            {sailor.name}
            {sailor.age ? `, ${sailor.age}` : ''}
          </Text>
          <View style={styles.roleRow}>
            <Text style={styles.role}>{sailor.roleLabel}</Text>
            {sailor.rating > 0 && (
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={12} color={SailinqColors.star} />
                <Text style={styles.ratingText}>{sailor.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          <View style={styles.stats}>
            <StatBox
              value={sailor.miles.toLocaleString('pl')}
              label="MIL MORSKICH"
              sub={`${sailor.milesVerified.toLocaleString('pl')} verified`}
            />
            <StatBox value={String(sailor.trips)} label="REJSÓW" sub={`${sailor.reviews} recenzji`} />
            <StatBox value={sailor.rating > 0 ? sailor.rating.toFixed(1) : '—'} label="OCENA" sub="załoganta" />
          </View>

          {sailor.tags.length > 0 && (
            <View style={styles.tags}>
              {sailor.tags.map((t) => (
                <Tag key={t} label={t} tone="mint" />
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: SailinqRadius.lg,
    overflow: 'hidden',
    backgroundColor: SailinqColors.surface,
  },
  behind: {
    transform: [{ scale: 0.95 }],
  },
  noPhoto: { backgroundColor: SailinqColors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  noPhotoInitial: { color: SailinqColors.mint, fontSize: 110, fontWeight: '800' },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  locPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10,26,44,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SailinqRadius.pill,
  },
  locText: { color: SailinqColors.text, fontSize: 12, fontWeight: '600' },
  bottom: {
    marginTop: 'auto',
    padding: 18,
    gap: 10,
  },
  name: { color: SailinqColors.text, fontSize: 28, fontWeight: '800' },
  roleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  role: { color: SailinqColors.textMuted, fontSize: 14, fontWeight: '600' },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10,26,44,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SailinqRadius.pill,
  },
  ratingText: { color: SailinqColors.text, fontSize: 13, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stamp: {
    position: 'absolute',
    top: 60,
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  like: { left: 24, borderColor: SailinqColors.like, transform: [{ rotate: '-16deg' }] },
  nope: { right: 24, borderColor: SailinqColors.nope, transform: [{ rotate: '16deg' }] },
  stampText: { fontSize: 32, fontWeight: '900', letterSpacing: 2 },
});
