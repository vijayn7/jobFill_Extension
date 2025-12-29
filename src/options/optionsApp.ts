import { renderSettingsForm } from './components/settingsForm';
import { renderMemoryManager } from './components/memoryList';

export const initOptionsApp = (): void => {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) {
    return;
  }

  root.innerHTML = `
    <div class="options-layout">
      <section id="settings-panel"></section>
      <section id="memory-panel"></section>
    </div>
  `;

  const settingsPanel = root.querySelector<HTMLElement>('#settings-panel');
  const memoryPanel = root.querySelector<HTMLElement>('#memory-panel');

  if (settingsPanel) {
    void renderSettingsForm(settingsPanel);
  }

  if (memoryPanel) {
    void renderMemoryManager(memoryPanel);
  }
};
