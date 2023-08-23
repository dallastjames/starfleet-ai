import { OcPaperairplane3 } from "solid-icons/oc";
import { createSignal } from "solid-js";
import { useChatContext } from "./chat-context";
import { MessageAuthor } from "../../enums";

export function ChatInputBar() {
  const { addMessage } = useChatContext();
  const [value, setValue] = createSignal("");

  async function sendMessage() {
    addMessage(value(), MessageAuthor.Human);
    setValue("");
  }

  function handleFormSubmit(e: SubmitEvent) {
    e.preventDefault();
    sendMessage();
  }

  function checkForKeyboardSubmit(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div class="w-full bg-neutral px-4 py-2 shadow-xl">
      <form onSubmit={handleFormSubmit} class="w-full flex gap-4 items-start">
        <textarea
          class="textarea textarea-bordered textarea-neutral flex-1 lg:h-44 h-32"
          value={value()}
          onInput={(e) => setValue(e.target.value)}
          onKeyDown={checkForKeyboardSubmit}
        />
        <button class="btn btn-primary">
          <OcPaperairplane3 />
        </button>
      </form>
    </div>
  );
}
