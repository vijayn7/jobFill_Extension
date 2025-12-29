import type { PlatformName } from '../../shared/types';
import { platformAdapters } from './index';

const coerceUrl = (input: string | URL): URL | null => {
  if (input instanceof URL) {
    return input;
  }

  try {
    return new URL(input);
  } catch {
    if (!input) {
      return null;
    }
    try {
      return new URL(`https://${input}`);
    } catch {
      return null;
    }
  }
};

export const detectPlatform = (input: string | URL): PlatformName => {
  const url = coerceUrl(input);
  if (!url) {
    return 'unknown';
  }

  const match = platformAdapters.find((adapter) => adapter.matchUrl(url));
  return match?.platform ?? 'unknown';
};
