import { MessageType } from '../../background/messages';
import type {
  MessageRequestFor,
  MessageRequestMap,
  MessageResponseFor,
} from '../../shared/types';

const sendMessage = async <T extends keyof MessageRequestMap>(
  message: MessageRequestFor<T>,
): Promise<MessageResponseFor<T>> => {
  return chrome.runtime.sendMessage(message);
};

export const renderImportExport = (
  container: HTMLElement,
  onImportComplete: () => void,
  onStatus: (message: string) => void,
): void => {
  container.innerHTML = `
    <div class="import-export">
      <div class="import-export__group">
        <button class="button button--ghost" data-action="export">Export JSON</button>
      </div>
      <div class="import-export__group">
        <label class="import-export__label">
          Import JSON
          <input type="file" accept="application/json" data-action="import-file" />
        </label>
      </div>
    </div>
  `;

  const exportButton = container.querySelector<HTMLButtonElement>('[data-action="export"]');
  const importInput = container.querySelector<HTMLInputElement>('[data-action="import-file"]');

  if (exportButton) {
    exportButton.addEventListener('click', async () => {
      try {
        const response = await sendMessage({
          type: MessageType.EXPORT_JSON,
        });
        const blob = new Blob([response.payload.json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jobfill-memory-${new Date().toISOString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        onStatus('Exported memory entries.');
      } catch (error) {
        console.error('Export failed', error);
        onStatus('Export failed. Please try again.');
      }
    });
  }

  if (importInput) {
    importInput.addEventListener('change', async () => {
      const file = importInput.files?.[0];
      if (!file) {
        return;
      }
      try {
        const text = await file.text();
        await sendMessage({
          type: MessageType.IMPORT_JSON,
          payload: { json: text },
        });
        importInput.value = '';
        onStatus('Imported memory entries.');
        onImportComplete();
      } catch (error) {
        console.error('Import failed', error);
        importInput.value = '';
        onStatus('Import failed. Ensure the file is valid JSON.');
      }
    });
  }
};
