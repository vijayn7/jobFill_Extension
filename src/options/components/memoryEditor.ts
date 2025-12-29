import type { MemoryEntry } from '../../shared/types';

export const renderMemoryEditor = (
  container: HTMLElement,
  entry: MemoryEntry,
  onSave: (value: string) => void,
  onCancel: () => void,
): void => {
  container.innerHTML = `
    <form class="memory-editor">
      <label class="memory-editor__label">
        Update answer
        <textarea class="memory-editor__input" rows="3"></textarea>
      </label>
      <div class="memory-editor__actions">
        <button type="submit" class="button button--primary">Save</button>
        <button type="button" class="button button--ghost" data-action="cancel">Cancel</button>
      </div>
    </form>
  `;

  const form = container.querySelector<HTMLFormElement>('form');
  const input = container.querySelector<HTMLTextAreaElement>('textarea');
  const cancel = container.querySelector<HTMLButtonElement>('[data-action="cancel"]');

  if (!form || !input || !cancel) {
    return;
  }

  input.value = entry.answer_text;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSave(input.value.trim());
  });

  cancel.addEventListener('click', () => {
    onCancel();
  });
};
