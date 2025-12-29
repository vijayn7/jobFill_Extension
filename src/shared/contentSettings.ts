import type { ContentSettings } from './types';

export const CONTENT_SETTINGS_STORAGE_KEY = 'jobfill_content_settings';

export const DEFAULT_CONTENT_SETTINGS: ContentSettings = {
  advanceAfterFill: true,
  autofillConfidenceThreshold: 0.72,
  autofillOverwriteExisting: false,
};

const toBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
};

const toThreshold = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(1, Math.max(0, value));
  }
  return DEFAULT_CONTENT_SETTINGS.autofillConfidenceThreshold;
};

export const normalizeContentSettings = (input: unknown): ContentSettings => {
  if (input && typeof input === 'object') {
    const raw = input as {
      advanceAfterFill?: unknown;
      autofillConfidenceThreshold?: unknown;
      autofillOverwriteExisting?: unknown;
    };

    return {
      advanceAfterFill: toBoolean(
        raw.advanceAfterFill,
        DEFAULT_CONTENT_SETTINGS.advanceAfterFill,
      ),
      autofillConfidenceThreshold: toThreshold(raw.autofillConfidenceThreshold),
      autofillOverwriteExisting: toBoolean(
        raw.autofillOverwriteExisting,
        DEFAULT_CONTENT_SETTINGS.autofillOverwriteExisting,
      ),
    };
  }

  return { ...DEFAULT_CONTENT_SETTINGS };
};
