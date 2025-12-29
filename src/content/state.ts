import type { ExtensionSettings } from '../shared/types';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, normalizeSettings } from '../shared/settings';

let cachedSettings: ExtensionSettings = { ...DEFAULT_SETTINGS };
let hasLoaded = false;

const loadSettingsFromStorage = async (): Promise<ExtensionSettings> => {
  const stored = await chrome.storage.sync.get(SETTINGS_STORAGE_KEY);
  const normalized = normalizeSettings(stored[SETTINGS_STORAGE_KEY]);
  cachedSettings = normalized;
  hasLoaded = true;
  return normalized;
};

export const getSettings = async (): Promise<ExtensionSettings> => {
  if (hasLoaded) {
    return cachedSettings;
  }

  return loadSettingsFromStorage();
};

export const startSettingsListener = (): void => {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') {
      return;
    }
    if (changes[SETTINGS_STORAGE_KEY]) {
      cachedSettings = normalizeSettings(changes[SETTINGS_STORAGE_KEY].newValue);
      hasLoaded = true;
    }
  });
};
