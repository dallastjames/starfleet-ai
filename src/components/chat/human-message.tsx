import { Message } from "../../models/message";

export function ChatHumanMessage({ message }: { message: Message }) {
  return (
    <div class="chat chat-end">
      <div class="chat-image avatar">
        <div class="w-10 rounded-full">
          <img src="https://i.pravatar.cc/150?img=52" />
        </div>
      </div>
      <div class="chat-bubble lg:max-w-[80%] bg-neutral whitespace-pre-wrap">
        {message.text}
      </div>
    </div>
  );
}
