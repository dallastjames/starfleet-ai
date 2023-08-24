import { createEffect } from 'solid-js';
import { ChatHeader } from '../components/chat/header';
import { ChatInputBar } from '../components/chat/input-bar';
import { ChatMessageSpace } from '../components/chat/message-space';
import { ChatSidebarWrapper } from '../components/chat/sidebar';
import { useUser } from '../utils/supabase';
import { useToast } from '../utils/toast';
import { useNavigate } from '@solidjs/router';

export default function ChatPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [user] = useUser();

  createEffect(() => {
    if (user() === null) {
      toast.error('You must be logged in to view this page');
      navigate('/', { replace: true });
    }
  });

  return (
    <>
      {user() ? (
        <>
          <div class="absolute left-0 right-0 top-0 z-50">
            <ChatHeader />
          </div>
          <ChatSidebarWrapper>
            <div class="relative max-h-full w-full flex-1">
              <div class="grid h-full max-h-full w-full grid-cols-1 pb-36 lg:pb-48">
                <div id="message-space-container" class="max-h-full overflow-y-auto">
                  <ChatMessageSpace />
                </div>
              </div>
              <div class="absolute bottom-0 left-0 right-0">
                <ChatInputBar />
              </div>
            </div>
          </ChatSidebarWrapper>
        </>
      ) : (
        <div class="flex h-screen w-screen flex-col items-center justify-center">
          <p class="text-lg">Loading...</p>
        </div>
      )}
    </>
  );
}
