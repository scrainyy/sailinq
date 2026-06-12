import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SailinqColors } from '@/constants/sailinq';

type TabName = 'index' | 'trips' | 'chat' | 'profile';

const ICONS: Record<TabName, keyof typeof Ionicons.glyphMap> = {
  index: 'compass-outline',
  trips: 'boat-outline',
  chat: 'chatbubble-outline',
  profile: 'person-outline',
};

const LABELS: Record<TabName, string> = {
  index: 'Discover',
  trips: 'Trips',
  chat: 'Chat',
  profile: 'Profil',
};

// Kolejność z + w środku: Discover, Trips, [+], Chat, Profil
const LEFT: TabName[] = ['index', 'trips'];
const RIGHT: TabName[] = ['chat', 'profile'];

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <SailinqTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: SailinqColors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="trips" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function SailinqTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const activeName = state.routes[state.index]?.name as TabName;

  const renderTab = (name: TabName) => {
    const route = state.routes.find((r: any) => r.name === name);
    const focused = activeName === name;
    return (
      <Pressable
        key={name}
        style={styles.tab}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route?.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) navigation.navigate(name);
        }}>
        <Ionicons
          name={ICONS[name]}
          size={24}
          color={focused ? SailinqColors.mint : SailinqColors.textMuted}
        />
        <Text style={[styles.label, focused && { color: SailinqColors.mint }]}>{LABELS[name]}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {LEFT.map(renderTab)}

      <Pressable style={styles.fabWrap} onPress={() => router.push('/create')}>
        <View style={styles.fab}>
          <Ionicons name="add" size={30} color={SailinqColors.mintDark} />
        </View>
      </Pressable>

      {RIGHT.map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: SailinqColors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SailinqColors.border,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    color: SailinqColors.textMuted,
    fontWeight: '600',
  },
  fabWrap: {
    width: 64,
    alignItems: 'center',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: SailinqColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    shadowColor: SailinqColors.mint,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
