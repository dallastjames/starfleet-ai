import { createSignal } from 'solid-js';
import { Table, useSupabaseClient } from '../../utils/supabase';
import { AuthorType } from '../../enums';
import { createId } from '../../utils/create-id';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const [messages, setMessages] = createSignal<Table<'chat_message'>[]>([]);
const [currentChat, setCurrentChat] = createSignal<Table<'chat'> | null>(null);

function handleStreamedMessage(messageId: string, newText: string) {
  setMessages(m =>
    m.map(message => {
      if (message.id === messageId) {
        return {
          ...message,
          message_text: message.message_text + newText,
        };
      }
      return message;
    }),
  );
}

export function useChatContext() {
  const supabase = useSupabaseClient();
  return {
    chat: currentChat,
    messages,
    addMessage: (message: Table<'chat_message'>) => {
      if (messages().find(m => m.id === message.id)) return;
      setMessages(m => [...m, message]);
    },
    sendForResponse: async (message: Table<'chat_message'>) => {
      const aiResponseMessage: Table<'chat_message'> = {
        id: createId(),
        chat_id: message.chat_id,
        message_text: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: AuthorType.Ai,
      };

      setMessages(m => [...m, aiResponseMessage]);

      const { data } = await supabase.auth.getSession();

      await fetchEventSource(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        body: JSON.stringify({
          input: message.message_text,
          message_id: aiResponseMessage.id,
          chat_id: message.chat_id,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.session?.access_token}`,
        },
        onmessage(ev) {
          handleStreamedMessage(aiResponseMessage.id, ev.data);
        },
      });
    },
    removeMessage: (id: string) => setMessages(m => m.filter(m => m.id !== id)),
    resetMessages: (messages?: Table<'chat_message'>[]) => setMessages(messages ?? []),
    openChat: (chat: Table<'chat'>) => {
      setCurrentChat(chat);
      setMessages([]);
    },
  };
}
