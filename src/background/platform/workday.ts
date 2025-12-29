import type { PlatformAdapter } from '../../shared/types';

export const workdayAdapter: PlatformAdapter = {
  platform: 'workday',
  matchUrl: (url) =>
    url.hostname.endsWith('myworkdayjobs.com') || url.hostname.endsWith('workdayjobs.com'),
  containerSelectors: [
    '[data-automation-id="formField"]',
    '[data-automation-id="promptLabel"]',
    '[data-automation-id="panel"]',
  ],
  labelSelectors: [
    '[data-automation-id="questionLabel"]',
    '[data-automation-id="prompt"]',
    '[data-automation-id="fieldLabel"]',
    'label',
    'legend',
  ],
};
