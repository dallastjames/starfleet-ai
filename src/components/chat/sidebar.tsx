import { ParentProps, createEffect } from 'solid-js';
import { dialogShowModalClick } from '../../utils/modal';
import { NewChatModal } from './new-chat-modal';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { OcPlus3 } from 'solid-icons/oc';
import { cn } from '../../utils/tailwind';
import { useChatContext } from './chat-context';
import { Table, useChatList, useSupabaseClient } from '../../utils/supabase';
import { useToast } from '../../utils/toast';

export function ChatSidebarWrapper({ children }: ParentProps) {
  const createModalId = 'create-new-chat-modal';

  const supabase = useSupabaseClient();
  const toast = useToast();
  const navigate = useNavigate();
  const { openChat } = useChatContext();
  const [params, setParams] = useSearchParams();
  const [chatList, { refetch }] = useChatList();

  createEffect(() => {
    const chatId = params.id;
    if (!chatId) return;
    const chats = chatList();
    if (!chats || !chats.length) return;
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    openChat(chat);
  });

  function closeDrawer() {
    const drawer: HTMLInputElement | null = document.getElementById(
      'my-drawer-2',
    ) as HTMLInputElement;
    if (drawer) {
      drawer.checked = false;
    }
  }

  function onCreateNewChat() {
    dialogShowModalClick(createModalId)();
    closeDrawer();
  }

  function selectChat(chat: Table<'chat'>) {
    setParams({ id: chat.id });
    openChat(chat);
    closeDrawer();
  }

  async function createNewChat(name: string) {
    const { data: newChat, error } = await supabase
      .from('chat')
      .insert({ name })
      .select('*')
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    selectChat(newChat);
    refetch();
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate('/', { replace: true });
  }

  return (
    <>
      <div class="drawer h-screen lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
        <div class="drawer-content flex max-h-screen flex-col items-center justify-center pt-12">
          {children}
        </div>
        <div class="drawer-side pt-12">
          <label for="my-drawer-2" class="drawer-overlay"></label>
          <div class="menu h-full w-80 bg-base-200 p-4 text-base-content lg:shadow-xl">
            <h4 class="mb-3 w-full text-xl">Chat History</h4>
            <ul class="flex flex-1 flex-col gap-2">
              <li>
                <button type="button" onClick={onCreateNewChat}>
                  <OcPlus3 class="fill-white text-lg" />
                  Create New Chat
                </button>
              </li>
              {chatList()?.map(chat => (
                <li
                  class={cn({
                    'rounded bg-secondary/70 font-semibold': params.id === chat.id,
                  })}
                >
                  <button onClick={() => selectChat(chat)}>{chat.name}</button>
                </li>
              ))}
              <li class="flex-1 bg-base-200"></li>
              <li>
                <button type="button" onClick={logout}>
                  Log Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <NewChatModal modalId={createModalId} onCreate={createNewChat} />
    </>
  );
}
