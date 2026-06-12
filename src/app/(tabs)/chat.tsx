import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Header, Screen } from '@/components/sailinq/ui';
import { SailinqColors, SailinqRadius } from '@/constants/sailinq';
import { listConversations, type Conversation } from '@/lib/chat';

export default function ChatScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      listConversations().then((res) => {
        setConversations(res.conversations);
        setLoading(false);
      });
    }, [])
  );

  const tripChats = conversations.filter((c) => c.isTrip);
  const dmChats = conversations.filter((c) => !c.isTrip);

  return (
    <Screen>
      <Header title="Chat" />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={SailinqColors.mint} size="large" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={56} color={SailinqColors.textMuted} />
          <Text style={styles.emptyTitle}>Brak rozmów</Text>
          <Text style={styles.emptySub}>
            Zmatchuj się z kimś w Discover, a rozmowa pojawi się tutaj.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {tripChats.length > 0 && (
            <>
              <SectionLabel icon="boat" text="Czaty rejsowe" />
              {tripChats.map((c) => (
                <ChatRow key={c.id} chat={c} />
              ))}
            </>
          )}

          <SectionLabel icon="heart" text="Wiadomości (po matchu)" />
          {dmChats.length === 0 ? (
            <Text style={styles.noneText}>Brak — zmatchuj się w Discover.</Text>
          ) : (
            dmChats.map((c) => <ChatRow key={c.id} chat={c} />)
          )}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </Screen>
  );
}

function SectionLabel({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.section}>
      <Ionicons name={icon} size={14} color={SailinqColors.mint} />
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

function ChatRow({ chat }: { chat: Conversation }) {
  const router = useRouter();
  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({
          pathname: '/chat/[id]',
          params: { id: chat.id, title: chat.title, photo: chat.photo, isTrip: String(chat.isTrip) },
        })
      }>
      <View>
        {chat.photo ? (
          <Image source={{ uri: chat.photo }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarEmpty]}>
            <Text style={styles.avatarInitial}>{chat.title[0]?.toUpperCase()}</Text>
          </View>
        )}
        {chat.isTrip && (
          <View style={styles.anchorBadge}>
            <Ionicons name="boat" size={11} color={SailinqColors.mintDark} />
          </View>
        )}
      </View>

      <View style={styles.rowBody}>
        <Text style={styles.name} numberOfLines={1}>
          {chat.title}
        </Text>
        <Text style={styles.last} numberOfLines={1}>
          {chat.lastMessage ?? 'Napisz pierwszą wiadomość…'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={SailinqColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 40 },
  emptyTitle: { color: SailinqColors.text, fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySub: { color: SailinqColors.textMuted, fontSize: 14, textAlign: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  section: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18, marginBottom: 8 },
  sectionText: {
    color: SailinqColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  noneText: { color: SailinqColors.textFaint, fontSize: 14, paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: SailinqColors.surfaceAlt },
  avatarEmpty: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: SailinqColors.mint, fontSize: 22, fontWeight: '800' },
  anchorBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: SailinqColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: SailinqColors.bg,
  },
  rowBody: { flex: 1 },
  name: { color: SailinqColors.text, fontSize: 16, fontWeight: '700' },
  last: { color: SailinqColors.textMuted, fontSize: 14, marginTop: 3 },
});
