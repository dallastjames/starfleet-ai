import { createSignal } from 'solid-js';
import { dialogHideModalClick } from '../../utils/modal';
import { ChatModel } from '../../enums';

export function NewChatModal({
  modalId,
  onCreate,
}: {
  modalId: string;
  onCreate: (name: string, model: ChatModel.TYPE) => void;
}) {
  const [name, setName] = createSignal('');
  const [model, setModel] = createSignal<ChatModel.TYPE>(ChatModel.GPT3_5);

  function handleCreate() {
    if (!name()) return;
    dialogHideModalClick(modalId)();
    onCreate(name(), model());
    setName('');
  }

  function checkForKeyboardSubmit(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  }

  return (
    <dialog id={modalId} class="modal">
      <div class="modal-box">
        <h3 class="mb-4 text-xl">Create New Chat</h3>
        <input
          type="text"
          class="input input-bordered w-full"
          placeholder="Chat Name"
          value={name()}
          onInput={e => setName(e.currentTarget.value)}
          onKeyDown={checkForKeyboardSubmit}
        />
        <div class="mt-4 flex justify-center">
          <div class="join">
            <input
              class="btn join-item btn-sm"
              type="radio"
              name="options"
              aria-label="GPT 3.5"
              checked={model() === ChatModel.GPT3_5}
              onChange={e => (e.target.checked ? setModel(ChatModel.GPT3_5) : null)}
            />
            <input
              class="btn join-item btn-sm"
              type="radio"
              name="options"
              aria-label="GPT 4"
              checked={model() === ChatModel.GPT4}
              onChange={e => (e.target.checked ? setModel(ChatModel.GPT4) : null)}
            />
          </div>
        </div>
        <div class="modal-action">
          <button
            class="btn-neutral btn-sm rounded"
            type="button"
            onClick={dialogHideModalClick(modalId)}
          >
            Cancel
          </button>
          <button
            class="btn-primary btn-sm rounded"
            type="button"
            onClick={handleCreate}
            disabled={!name()}
          >
            Create
          </button>
        </div>
      </div>
    </dialog>
  );
}
