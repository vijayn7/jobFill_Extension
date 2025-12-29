import type { EmbeddingsMode, ExtensionSettings, SensitiveHandling } from './types';

export const SETTINGS_STORAGE_KEY = 'jobfill_settings';

export const DEFAULT_SETTINGS: ExtensionSettings = {
  sensitiveHandling: 'block',
  embeddingsMode: 'off',
  embeddingsEndpoint: '',
};

const toSensitiveHandling = (value: unknown): SensitiveHandling => {
  if (value === 'warn_only' || value === 'block') {
    return value;
  }
  return DEFAULT_SETTINGS.sensitiveHandling;
};

const toEmbeddingsMode = (value: unknown): EmbeddingsMode => {
  if (value === 'local') {
    return value;
  }
  return DEFAULT_SETTINGS.embeddingsMode;
};

const toEmbeddingsEndpoint = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return DEFAULT_SETTINGS.embeddingsEndpoint;
};

export const normalizeSettings = (input: unknown): ExtensionSettings => {
  if (input && typeof input === 'object') {
    const raw = input as {
      sensitiveHandling?: unknown;
      embeddingsMode?: unknown;
      embeddingsEndpoint?: unknown;
    };
    return {
      sensitiveHandling: toSensitiveHandling(raw.sensitiveHandling),
      embeddingsMode: toEmbeddingsMode(raw.embeddingsMode),
      embeddingsEndpoint: toEmbeddingsEndpoint(raw.embeddingsEndpoint),
    };
  }

  return { ...DEFAULT_SETTINGS };
};
