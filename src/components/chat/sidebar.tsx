import { ParentProps, createSignal } from "solid-js";
import { dialogShowModalClick } from "../../utils/modal";
import { NewChatModal } from "./new-chat-modal";
import { Chat } from "../../models/chat";
import { useSearchParams } from "@solidjs/router";
import { OcPlus3 } from "solid-icons/oc";
import { cn } from "../../utils/tailwind";
import { useChatContext } from "./chat-context";

export function ChatSidebarWrapper({ children }: ParentProps) {
  const createModalId = "create-new-chat-modal";

  const { openChat } = useChatContext();
  const [chats, setChats] = createSignal<Chat[]>([
    { id: "12345", name: "Melee Combat Talents" },
  ]);
  const [params, setParams] = useSearchParams();

  function closeDrawer() {
    const drawer: HTMLInputElement | null = document.getElementById(
      "my-drawer-2"
    ) as HTMLInputElement;
    if (drawer) {
      drawer.checked = false;
    }
  }

  function onCreateNewChat() {
    dialogShowModalClick(createModalId)();
    closeDrawer();
  }

  function selectChat(chat: Chat) {
    setParams({ id: chat.id });
    openChat(chat);
    closeDrawer();
  }

  async function createNewChat(name: string) {
    setChats([{ id: "123456", name }, ...chats()]);
  }

  return (
    <>
      <div class="drawer lg:drawer-open h-screen">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex flex-col items-center justify-center pt-12 max-h-screen">
          {children}
        </div>
        <div class="drawer-side pt-12">
          <label for="my-drawer-2" class="drawer-overlay"></label>
          <div class="menu p-4 w-80 h-full bg-base-200 text-base-content lg:shadow-xl">
            <h4 class="w-full text-xl mb-3">Chat History</h4>
            <ul>
              <li class="mb-2">
                <button type="button" onClick={onCreateNewChat}>
                  <OcPlus3 class="fill-white text-lg" />
                  Create New Chat
                </button>
              </li>
              {chats().map((chat) => (
                <li
                  class={cn({
                    "mb-2": true,
                    "bg-secondary/70 rounded": params.id === chat.id,
                  })}
                >
                  <button onClick={() => selectChat(chat)}>{chat.name}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <NewChatModal modalId={createModalId} onCreate={createNewChat} />
    </>
  );
}
