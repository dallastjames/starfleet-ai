import { OcThreebars2 } from "solid-icons/oc";
import { useChatContext } from "./chat-context";

export function ChatHeader() {
  const { chat } = useChatContext();

  return (
    <div class="w-full bg-neutral py-2 flex items-center shadow-xl">
      <div class="prose lg:w-80 px-4 flex items-center gap-4 relative z-[1]">
        <label
          for="my-drawer-2"
          class="btn btn-sm btn-outline btn-primary drawer-button lg:hidden"
        >
          <OcThreebars2 class="fill-white" />
        </label>
        <h3 class="mt-0 hidden lg:block">Star Fleet AI</h3>
      </div>
      <div class="flex-1 text-center px-4 flex items-center justify-center lg:relative z-0 absolute inset-0">
        <label>{chat()?.name}</label>
      </div>
    </div>
  );
}
