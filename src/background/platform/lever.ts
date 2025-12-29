import type { PlatformAdapter } from '../../shared/types';

export const leverAdapter: PlatformAdapter = {
  platform: 'lever',
  matchUrl: (url) => url.hostname.endsWith('lever.co'),
  containerSelectors: [
    '.application-question',
    '.application-question-field',
    '.application-field',
    '.application-form',
  ],
  labelSelectors: [
    '.application-question-title',
    '.application-question-label',
    '.application-label',
    'label',
    'legend',
  ],
};
