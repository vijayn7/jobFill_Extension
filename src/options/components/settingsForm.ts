import type { EmbeddingsMode, ExtensionSettings, SensitiveHandling } from '../../shared/types';
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
      <div class="settings__group">
        <h2>Embeddings matching</h2>
        <p class="settings__description">
          Enable semantic matching with a local companion service. When off, JobFill uses the
          baseline lexical matcher.
        </p>
        <label class="settings__option">
          <input type="radio" name="embeddingsMode" value="off" />
          Off (baseline matching)
        </label>
        <label class="settings__option">
          <input type="radio" name="embeddingsMode" value="local" />
          Use local companion endpoint
        </label>
        <label class="settings__field">
          <span>Local endpoint</span>
          <input
            class="settings__input"
            type="text"
            name="embeddingsEndpoint"
            placeholder="http://127.0.0.1:5000/embeddings"
          />
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

const applyEmbeddingsMode = (root: HTMLElement, mode: EmbeddingsMode): void => {
  const input = root.querySelector<HTMLInputElement>(
    `input[name="embeddingsMode"][value="${mode}"]`,
  );
  if (input) {
    input.checked = true;
  }
};

const applyEmbeddingsEndpoint = (root: HTMLElement, endpoint: string): void => {
  const input = root.querySelector<HTMLInputElement>('input[name="embeddingsEndpoint"]');
  if (input) {
    input.value = endpoint;
  }
};

const getSelectedSensitiveHandling = (root: HTMLElement): SensitiveHandling => {
  const selected = root.querySelector<HTMLInputElement>('input[name="sensitiveHandling"]:checked');
  return selected?.value === 'warn_only' ? 'warn_only' : 'block';
};

const getSelectedEmbeddingsMode = (root: HTMLElement): EmbeddingsMode => {
  const selected = root.querySelector<HTMLInputElement>('input[name="embeddingsMode"]:checked');
  return selected?.value === 'local' ? 'local' : 'off';
};

const getEmbeddingsEndpoint = (root: HTMLElement): string => {
  const input = root.querySelector<HTMLInputElement>('input[name="embeddingsEndpoint"]');
  return input?.value?.trim() ?? '';
};

const persistSettings = async (root: HTMLElement): Promise<void> => {
  const next: ExtensionSettings = {
    ...DEFAULT_SETTINGS,
    sensitiveHandling: getSelectedSensitiveHandling(root),
    embeddingsMode: getSelectedEmbeddingsMode(root),
    embeddingsEndpoint: getEmbeddingsEndpoint(root),
  };

  await saveSettings(next);
};

export const renderSettingsForm = async (root: HTMLElement): Promise<void> => {
  root.innerHTML = buildFormMarkup();

  const settings = await loadSettings();
  applySelection(root, settings.sensitiveHandling);
  applyEmbeddingsMode(root, settings.embeddingsMode);
  applyEmbeddingsEndpoint(root, settings.embeddingsEndpoint);

  root.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }

    if (
      target.name === 'sensitiveHandling'
      || target.name === 'embeddingsMode'
      || target.name === 'embeddingsEndpoint'
    ) {
      void persistSettings(root);
    }
  });

  root.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement | null;
    if (!target || target.name !== 'embeddingsEndpoint') {
      return;
    }
    void persistSettings(root);
  });
};
