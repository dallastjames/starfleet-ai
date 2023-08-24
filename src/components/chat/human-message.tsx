import { Table } from '../../utils/supabase';

export function ChatHumanMessage({ message }: { message: Table<'chat_message'> }) {
  return (
    <div class="chat chat-end">
      <div class="avatar chat-image">
        <div class="w-10 rounded-full">
          <img src="https://i.pravatar.cc/150?img=52" />
        </div>
      </div>
      <div class="chat-bubble whitespace-pre-wrap bg-neutral lg:max-w-[80%]">
        {message.message_text}
      </div>
    </div>
  );
}
