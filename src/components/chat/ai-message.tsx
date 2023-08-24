import { Table } from '../../utils/supabase';

export function ChatAIMessage({ message }: { message: Table<'chat_message'> }) {
  return (
    <div class="chat chat-start">
      <div class="avatar chat-image">
        <div class="w-10 rounded-full">
          <img src="src/assets/starfleetai.png" />
        </div>
      </div>
      <div class="chat-bubble whitespace-pre-wrap bg-secondary/40 lg:max-w-[80%]">
        {message.message_text}
      </div>
    </div>
  );
}
