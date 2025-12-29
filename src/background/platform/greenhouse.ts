import type { PlatformAdapter } from '../../shared/types';

export const greenhouseAdapter: PlatformAdapter = {
  platform: 'greenhouse',
  matchUrl: (url) =>
    url.hostname.endsWith('greenhouse.io') || url.hostname.includes('greenhouse.io'),
  containerSelectors: [
    '.field',
    '.application-question',
    '.application-section',
    '.question',
    '.field-group',
  ],
  labelSelectors: [
    'label',
    '.question',
    '.field-label',
    '.application-question-title',
    '.question-label',
    'legend',
  ],
};
