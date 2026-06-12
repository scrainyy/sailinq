import { supabase } from '@/lib/supabase';

export type Conversation = {
  id: string;
  isTrip: boolean;
  title: string;
  photo: string;
  lastMessage: string | null;
  lastAt: string | null;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

/** Id zalogowanego użytkownika (do oznaczania „moich" wiadomości). */
export async function getMyId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/** Lista rozmów (DM po matchu + rejsowe). */
export async function listConversations(): Promise<{ conversations: Conversation[]; error?: string }> {
  const { data, error } = await supabase.rpc('my_conversations');
  if (error) return { conversations: [], error: error.message };
  const conversations = (data as any[]).map((r) => ({
    id: r.conversation_id,
    isTrip: r.is_trip,
    title: r.title,
    photo: r.photo ?? '',
    lastMessage: r.last_message,
    lastAt: r.last_at,
  }));
  return { conversations };
}

/** Wiadomości w rozmowie (od najstarszej). */
export async function getMessages(conversationId: string): Promise<{ messages: ChatMessage[]; error?: string }> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) return { messages: [], error: error.message };
  const messages = (data as any[]).map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    body: m.body,
    createdAt: m.created_at,
  }));
  return { messages };
}

/** Wyślij wiadomość. Zwraca zapisaną wiadomość. */
export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ message?: ChatMessage; error?: string }> {
  const myId = await getMyId();
  if (!myId) return { error: 'Nie jesteś zalogowany.' };

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: myId, body })
    .select('id, sender_id, body, created_at')
    .single();
  if (error) return { error: error.message };
  return {
    message: { id: data.id, senderId: data.sender_id, body: data.body, createdAt: data.created_at },
  };
}

/** Subskrybuj nowe wiadomości w rozmowie (real-time). Zwraca funkcję odsubskrybowania. */
export function subscribeToMessages(
  conversationId: string,
  onInsert: (m: ChatMessage) => void
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const m = payload.new as any;
        onInsert({ id: m.id, senderId: m.sender_id, body: m.body, createdAt: m.created_at });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
