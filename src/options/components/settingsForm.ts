import type { ExtensionSettings, SensitiveHandling } from '../../shared/types';
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  normalizeSettings,
} from '../../shared/settings';

const buildFormMarkup = (): string => {
  return `
    <section class="settings">
      <h1>JobFill Settings</h1>
      <div class="settings__group">
        <h2>Sensitive field handling</h2>
        <p class="settings__description">
          Control whether JobFill blocks autofill when it detects SSNs, dates of birth, passports,
          bank details, or tax IDs.
        </p>
        <label class="settings__option">
          <input type="radio" name="sensitiveHandling" value="block" />
          Block autofill and hide suggestions
        </label>
        <label class="settings__option">
          <input type="radio" name="sensitiveHandling" value="warn_only" />
          Warn only, allow fill
        </label>
      </div>
    </section>
  `;
};

const loadSettings = async (): Promise<ExtensionSettings> => {
  const stored = await chrome.storage.sync.get(SETTINGS_STORAGE_KEY);
  return normalizeSettings(stored[SETTINGS_STORAGE_KEY]);
};

const saveSettings = async (settings: ExtensionSettings): Promise<void> => {
  await chrome.storage.sync.set({
    [SETTINGS_STORAGE_KEY]: settings,
  });
};

const applySelection = (root: HTMLElement, handling: SensitiveHandling): void => {
  const input = root.querySelector<HTMLInputElement>(
    `input[name="sensitiveHandling"][value="${handling}"]`,
  );
  if (input) {
    input.checked = true;
  }
};

export const renderSettingsForm = async (root: HTMLElement): Promise<void> => {
  root.innerHTML = buildFormMarkup();

  const settings = await loadSettings();
  applySelection(root, settings.sensitiveHandling);

  root.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.name !== 'sensitiveHandling') {
      return;
    }

    const value = target.value === 'warn_only' ? 'warn_only' : 'block';
    const next: ExtensionSettings = {
      ...DEFAULT_SETTINGS,
      sensitiveHandling: value,
    };

    void saveSettings(next);
  });
};
