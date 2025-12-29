import type { ExtensionSettings, SensitiveHandling } from './types';

export const SETTINGS_STORAGE_KEY = 'jobfill_settings';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  sensitiveHandling: 'block',
};

const toSensitiveHandling = (value: unknown): SensitiveHandling => {
  if (value === 'warn_only' || value === 'block') {
    return value;
  }
  return DEFAULT_SETTINGS.sensitiveHandling;
};

export const normalizeSettings = (input: unknown): ExtensionSettings => {
  if (input && typeof input === 'object' && 'sensitiveHandling' in input) {
    const raw = (input as { sensitiveHandling?: unknown }).sensitiveHandling;
    return {
      sensitiveHandling: toSensitiveHandling(raw),
    };
  }

  return { ...DEFAULT_SETTINGS };
};
