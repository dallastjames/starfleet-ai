import { Message } from "../../models/message";

export function ChatAIMessage({ message }: { message: Message }) {
  return (
    <div class="chat chat-start">
      <div class="chat-image avatar">
        <div class="w-10 rounded-full">
          <img src="https://i.pravatar.cc/150?img=11" />
        </div>
      </div>
      <div class="chat-bubble lg:max-w-[80%] bg-secondary/40 whitespace-pre-wrap">
        {message.text}
      </div>
    </div>
  );
}
