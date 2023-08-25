import { OcThreebars2 } from 'solid-icons/oc';
import { useChatContext } from './chat-context';

export function ChatHeader() {
  const { chat } = useChatContext();

  return (
    <div class="relative flex w-full items-center py-2 shadow-xl">
      <div class="prose relative z-[1] flex items-center gap-2 px-4 lg:w-80">
        <label for="my-drawer-2" class="btn btn-primary btn-outline drawer-button btn-sm lg:hidden">
          <OcThreebars2 class="fill-white" />
        </label>
        <div class="avatar hidden lg:block">
          <div class="w-8 rounded">
            <img src="/src/assets/starfleetai.png" class="m-0" />
          </div>
        </div>
        <h3 class="mt-0 hidden lg:block">Star Fleet AI</h3>
      </div>
      <div class="absolute inset-0 z-0 flex flex-1 items-center justify-center px-4 text-center lg:relative">
        <label>
          {chat()?.name} ({chat()?.chat_model})
        </label>
      </div>
    </div>
  );
}
