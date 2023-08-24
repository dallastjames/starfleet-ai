import { createEffect, on, onCleanup } from 'solid-js';
import { useChatContext } from './chat-context';
import { ChatAIMessage } from './ai-message';
import { ChatHumanMessage } from './human-message';
import { AuthorType } from '../../enums';
import { realtimeChanges, useMessages } from '../../utils/supabase';

export function ChatMessageSpace() {
  const { chat, messages, addMessage, resetMessages } = useChatContext();
  const [chatMessages] = useMessages(chat);

  function scrollToBottom(forceScroll = false) {
    const space = document.getElementById('message-space-container');
    if (space) {
      const distanceFromBottom = space.scrollHeight - space.scrollTop - space.clientHeight;
      // Check if the second to last child element is in view
      const secondToLastChild = space.children[space.children.length - 2];
      const secondToLastChildInView = secondToLastChild
        ? secondToLastChild.getBoundingClientRect().top < space.getBoundingClientRect().bottom
        : true;
      const shouldScroll = distanceFromBottom < 300 || secondToLastChildInView; // only within this many px from bottom, or if the message was really long, the 2nd to last message is in view
      if (shouldScroll || forceScroll) {
        space.scrollTo({
          top: space.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }

  createEffect(
    on(messages, () => {
      scrollToBottom();
    }),
  );

  createEffect(() => {
    if (!chatMessages()) return;
    resetMessages(chatMessages());
    setTimeout(() => {
      scrollToBottom(true);
    }, 10);
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
