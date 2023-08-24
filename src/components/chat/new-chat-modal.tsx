import { createSignal } from 'solid-js';
import { dialogHideModalClick } from '../../utils/modal';

export function NewChatModal({
  modalId,
  onCreate,
}: {
  modalId: string;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = createSignal('');

  function handleCreate() {
    if (!name()) return;
    dialogHideModalClick(modalId)();
    onCreate(name());
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
