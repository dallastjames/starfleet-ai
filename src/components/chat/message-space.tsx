import { createEffect, on } from "solid-js";
import { useChatContext } from "./chat-context";
import { ChatAIMessage } from "./ai-message";
import { ChatHumanMessage } from "./human-message";

export function ChatMessageSpace() {
  const { messages } = useChatContext();

  createEffect(
    on(messages, () => {
      const space = document.getElementById("message-space-container");
      if (space) {
        const distanceFromBottom =
          space.scrollHeight - space.scrollTop - space.clientHeight;
        const shouldScroll = distanceFromBottom < 300; // only within this many px from bottom
        if (shouldScroll) {
          space.scrollTo({
            top: space.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    })
  );

  return (
    <div class="flex flex-col gap-4 pt-2 md:px-8 px-4 pb-4 max-w-5xl m-auto bg-neutral/40 min-h-full justify-end">
      {messages().map((message) =>
        message.createdBy === "ai" ? (
          <ChatAIMessage message={message} />
        ) : (
          <ChatHumanMessage message={message} />
        )
      )}
    </div>
  );
}
