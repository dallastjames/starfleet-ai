import { ParentProps, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { dialogShowModalClick } from '../../utils/modal';
import { NewChatModal } from './new-chat-modal';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { OcPlus3 } from 'solid-icons/oc';
import { cn } from '../../utils/tailwind';
import { useChatContext } from './chat-context';
import { Table, useChatList, useSupabaseClient } from '../../utils/supabase';
import { useToast } from '../../utils/toast';
import { ChatModel } from '../../enums';

export function ChatSidebarWrapper({ children }: ParentProps) {
  const createModalId = 'create-new-chat-modal';

  const supabase = useSupabaseClient();
  const toast = useToast();
  const navigate = useNavigate();
  const { openChat } = useChatContext();
  const [params, setParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [isSwiping, setIsSwiping] = createSignal(false);
  const [swipePercent, setSwipePercent] = createSignal(0);
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

  onMount(() => {
    let startX: number;
    let startY: number;
    let shouldOpenDrawer = false;
    let shouldCloseDrawer = false;
    const drawerWidth = 320;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleMoveWhenClosed = (e: TouchEvent) => {
      if (startX > 200) {
        // Ignore swipes that start too far to the right
        return;
      }

      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;

      if (deltaX > 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
        // The user is swiping back
        setIsSwiping(true);
        shouldOpenDrawer = deltaX > drawerWidth * 0.4;
        setSwipePercent(100 - Math.min(100, Math.max(0, (deltaX / drawerWidth) * 100)));
      }
    };

    const handleMoveWhenOpen = (e: TouchEvent) => {
      if (startX > drawerWidth + 100) {
        // Ignore swipes that start too far to the right
        return;
      }

      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;

      if (deltaX < 0 && Math.abs(deltaX) > Math.abs(deltaY)) {
        // The user is swiping forward
        setIsSwiping(true);
        shouldCloseDrawer = Math.abs(deltaX) > drawerWidth * 0.4;
        setSwipePercent(Math.min(100, Math.max(0, (Math.abs(deltaX) / drawerWidth) * 100)));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (menuOpen()) {
        return handleMoveWhenOpen(e);
      }
      return handleMoveWhenClosed(e);
    };

    const handleTouchEnd = () => {
      if (shouldOpenDrawer) {
        setMenuOpen(true);
      }
      if (shouldCloseDrawer) {
        setMenuOpen(false);
      }
      shouldOpenDrawer = false;
      shouldCloseDrawer = false;
      setIsSwiping(false);
      setSwipePercent(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    onCleanup(() => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    });
  });

  function closeDrawer() {
    setMenuOpen(false);
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

  async function createNewChat(name: string, model: ChatModel.TYPE) {
    const { data: newChat, error } = await supabase
      .from('chat')
      .insert({ name, chat_model: model })
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
        <input
          id="my-drawer-2"
          type="checkbox"
          class="drawer-toggle"
          checked={menuOpen()}
          onChange={e => setMenuOpen(e.target.checked)}
        />
        <div class="drawer-top-padding drawer-content flex max-h-screen flex-col items-center justify-center">
          {children}
        </div>
        <div class="drawer-side pt-12">
          <label for="my-drawer-2" class="drawer-overlay"></label>
          <div
            class="menu h-full w-80 bg-base-200 p-4 text-base-content lg:shadow-xl"
            style={isSwiping() ? { transform: `translateX(-${swipePercent()}%)` } : {}}
          >
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
