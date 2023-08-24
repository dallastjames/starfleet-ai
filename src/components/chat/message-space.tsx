import { createEffect, on, onCleanup } from 'solid-js';
import { useChatContext } from './chat-context';
import { ChatAIMessage } from './ai-message';
import { ChatHumanMessage } from './human-message';
import { AuthorType } from '../../enums';
import { realtimeChanges, useMessages, useSupabaseClient } from '../../utils/supabase';

export function ChatMessageSpace() {
  const supabase = useSupabaseClient();
  const { chat, messages, addMessage, resetMessages } = useChatContext();
  const [chatMessages] = useMessages(chat);

  createEffect(
    on(messages, () => {
      const space = document.getElementById('message-space-container');
      if (space) {
        const distanceFromBottom = space.scrollHeight - space.scrollTop - space.clientHeight;
        const shouldScroll = distanceFromBottom < 300; // only within this many px from bottom
        if (shouldScroll) {
          space.scrollTo({
            top: space.scrollHeight,
            behavior: 'smooth',
          });
        }
      }
    }),
  );

  createEffect(() => {
    if (!chatMessages()) return;
    resetMessages(chatMessages());
  });

  createEffect(() => {
    const chatId = chat()?.id;
    if (!chatId) return;
    const subscription = realtimeChanges(
      {
        table: 'chat_message',
        filter: `chat_id=eq.${chatId}`,
      },
      {
        onInsert: addMessage,
      },
    );
    onCleanup(() => subscription());
  });

  return (
    <div class="m-auto flex min-h-full max-w-5xl flex-col justify-end gap-4 bg-neutral/40 px-4 pb-4 pt-2 md:px-8">
      {messages().map(message =>
        message.created_by === AuthorType.Ai ? (
          <ChatAIMessage message={message} />
        ) : (
          <ChatHumanMessage message={message} />
        ),
      )}
    </div>
  );
}
