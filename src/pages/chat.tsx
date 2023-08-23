import { ChatHeader } from "../components/chat/header";
import { ChatInputBar } from "../components/chat/input-bar";
import { ChatMessageSpace } from "../components/chat/message-space";
import { ChatSidebarWrapper } from "../components/chat/sidebar";

export default function ChatPage() {
  return (
    <>
      <div class="absolute left-0 right-0 top-0 z-50">
        <ChatHeader />
      </div>
      <ChatSidebarWrapper>
        <div class="flex-1 w-full max-h-full relative">
          <div class="w-full max-h-full h-full lg:pb-48 pb-36 grid grid-cols-1">
            <div
              id="message-space-container"
              class="max-h-full overflow-y-auto"
            >
              <ChatMessageSpace />
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0">
            <ChatInputBar />
          </div>
        </div>
      </ChatSidebarWrapper>
    </>
  );
}
