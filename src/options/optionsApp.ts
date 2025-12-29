import { renderSettingsForm } from './components/settingsForm';

export const initOptionsApp = (): void => {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) {
    return;
  }

  renderSettingsForm(root);
};
