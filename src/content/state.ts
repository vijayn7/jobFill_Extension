import type { ContentSettings, ExtensionSettings } from '../shared/types';
import {
  CONTENT_SETTINGS_STORAGE_KEY,
  DEFAULT_CONTENT_SETTINGS,
  normalizeContentSettings,
} from '../shared/contentSettings';
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, normalizeSettings } from '../shared/settings';

let cachedSettings: ExtensionSettings = { ...DEFAULT_SETTINGS };
let hasLoaded = false;
let cachedContentSettings: ContentSettings = { ...DEFAULT_CONTENT_SETTINGS };
let hasLoadedContent = false;

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

const loadContentSettingsFromStorage = async (): Promise<ContentSettings> => {
  const stored = await chrome.storage.local.get(CONTENT_SETTINGS_STORAGE_KEY);
  const normalized = normalizeContentSettings(stored[CONTENT_SETTINGS_STORAGE_KEY]);
  cachedContentSettings = normalized;
  hasLoadedContent = true;
  return normalized;
};

export const getContentSettings = async (): Promise<ContentSettings> => {
  if (hasLoadedContent) {
    return cachedContentSettings;
  }

  return loadContentSettingsFromStorage();
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

export const startContentSettingsListener = (): void => {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') {
      return;
    }
    if (changes[CONTENT_SETTINGS_STORAGE_KEY]) {
      cachedContentSettings = normalizeContentSettings(
        changes[CONTENT_SETTINGS_STORAGE_KEY].newValue,
      );
      hasLoadedContent = true;
    }
  });
};
