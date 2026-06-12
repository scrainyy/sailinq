import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { getMessages, getMyId, sendMessage, subscribeToMessages, type ChatMessage } from '@/lib/chat';

export default function ConversationScreen() {
  const params = useLocalSearchParams<{ id: string; title: string; photo: string; isTrip: string }>();
  const id = params.id;
  const title = params.title ?? 'Rozmowa';
  const photo = params.photo ?? '';
  const isTrip = params.isTrip === 'true';

  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!id) return;
    let unsub: (() => void) | undefined;

    (async () => {
      const [me, res] = await Promise.all([getMyId(), getMessages(id)]);
      setMyId(me);
      setMessages(res.messages);
      setLoading(false);

      // Nowe wiadomości na żywo — dopisuj jeśli jeszcze ich nie ma.
      unsub = subscribeToMessages(id, (m) => {
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      });
    })();

    return () => unsub?.();
  }, [id]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !id) return;
    setDraft('');
    const res = await sendMessage(id, body);
    if (res.message) {
      setMessages((prev) => (prev.some((x) => x.id === res.message!.id) ? prev : [...prev, res.message!]));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color={SailinqColors.text} />
        </Pressable>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.headerAvatar} contentFit="cover" />
        ) : (
          <View style={[styles.headerAvatar, styles.headerAvatarEmpty]}>
            <Text style={styles.headerInitial}>{title[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.headerName} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub}>{isTrip ? 'Czat rejsowy' : 'Match'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={SailinqColors.mint} size="large" />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}>
            {messages.length === 0 ? (
              <Text style={styles.firstHint}>To początek Waszej rozmowy. Przełam lody! 👋</Text>
            ) : (
              messages.map((m) => <Bubble key={m.id} msg={m} mine={m.senderId === myId} />)
            )}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <SafeAreaView edges={['bottom']} style={styles.inputRow}>
            <View style={styles.inputWrap}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Napisz wiadomość…"
                placeholderTextColor={SailinqColors.textFaint}
                style={styles.input}
                multiline
              />
            </View>
            <Pressable style={[styles.sendBtn, !draft.trim() && styles.sendBtnOff]} onPress={send}>
              <Ionicons name="arrow-up" size={22} color={SailinqColors.mintDark} />
            </Pressable>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ msg, mine }: { msg: ChatMessage; mine: boolean }) {
  return (
    <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowOther]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, mine && { color: SailinqColors.mintDark }]}>{msg.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SailinqColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SailinqColors.border,
  },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: SailinqColors.surfaceAlt },
  headerAvatarEmpty: { alignItems: 'center', justifyContent: 'center' },
  headerInitial: { color: SailinqColors.mint, fontSize: 16, fontWeight: '800' },
  headerName: { color: SailinqColors.text, fontSize: 16, fontWeight: '700' },
  headerSub: { color: SailinqColors.mint, fontSize: 12, marginTop: 1 },
  messages: { padding: 16, gap: 8, flexGrow: 1 },
  firstHint: { color: SailinqColors.textMuted, textAlign: 'center', marginTop: 30, fontSize: 14 },
  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: SailinqColors.mint, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: SailinqColors.surface, borderBottomLeftRadius: 4 },
  bubbleText: { color: SailinqColors.text, fontSize: 15, lineHeight: 20 },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SailinqColors.border,
    backgroundColor: SailinqColors.surfaceMuted,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 12, paddingTop: 10 },
  inputWrap: {
    flex: 1,
    backgroundColor: SailinqColors.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    maxHeight: 120,
  },
  input: { color: SailinqColors.text, fontSize: 15 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SailinqColors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: { opacity: 0.5 },
});
