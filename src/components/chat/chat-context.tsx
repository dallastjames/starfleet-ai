import { createSignal } from 'solid-js';
import { Table } from '../../utils/supabase';

const [messages, setMessages] = createSignal<Table<'chat_message'>[]>([]);
const [currentChat, setCurrentChat] = createSignal<Table<'chat'> | null>(null);

export function useChatContext() {
  return {
    chat: currentChat,
    messages,
    addMessage: (message: Table<'chat_message'>) => {
      if (messages().find(m => m.id === message.id)) return;
      setMessages(m => [...m, message]);
    },
    removeMessage: (id: string) => setMessages(m => m.filter(m => m.id !== id)),
    resetMessages: (messages?: Table<'chat_message'>[]) => setMessages(messages ?? []),
    openChat: (chat: Table<'chat'>) => {
      setCurrentChat(chat);
      setMessages([]);
    },
  };
}
