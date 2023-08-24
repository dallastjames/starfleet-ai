import { OcPaperairplane3 } from 'solid-icons/oc';
import { createSignal } from 'solid-js';
import { useChatContext } from './chat-context';
import { Table, useSupabaseClient } from '../../utils/supabase';
import { createId } from '../../utils/create-id';
import { AuthorType } from '../../enums';
import { useToast } from '../../utils/toast';

export function ChatInputBar() {
  const supabase = useSupabaseClient();
  const toast = useToast();
  const { addMessage, removeMessage, chat } = useChatContext();
  const [value, setValue] = createSignal('');

  async function sendMessage() {
    if (!value()) return;
    const chat_id = chat()?.id;
    if (!chat_id) {
      console.error('No chat id found');
      return;
    }
    const newMessage: Table<'chat_message'> = {
      id: createId(),
      chat_id,
      message_text: value(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: AuthorType.Human,
    };

    addMessage(newMessage);

    const { error } = await supabase.from('chat_message').insert({
      id: newMessage.id,
      chat_id,
      message_text: value(),
    });

    if (error) {
      toast.error(error.message);
      console.error(error);
      removeMessage(newMessage.id);
      return;
    }

    setValue('');
  }

  function handleFormSubmit(e: SubmitEvent) {
    e.preventDefault();
    sendMessage();
  }

  function checkForKeyboardSubmit(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div class="w-full bg-neutral px-4 py-2 shadow-xl">
      <form onSubmit={handleFormSubmit} class="flex w-full items-start gap-4">
        <textarea
          class="textarea-neutral textarea textarea-bordered h-32 flex-1 lg:h-44"
          value={value()}
          onInput={e => setValue(e.target.value)}
          onKeyDown={checkForKeyboardSubmit}
        />
        <button class="btn btn-primary">
          <OcPaperairplane3 />
        </button>
      </form>
    </div>
  );
}
