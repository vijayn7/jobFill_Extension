import type { PingMessage, PongResponse } from '../shared/types';

const logPrefix = '[JobFill Extension]';

export const sendPing = () => {
  const message: PingMessage = { type: 'PING' };

  chrome.runtime.sendMessage(message, (response?: PongResponse) => {
    if (chrome.runtime.lastError) {
      console.warn(`${logPrefix} ping failed`, chrome.runtime.lastError.message);
      return;
    }

    if (response?.type === 'PONG') {
      console.log(`${logPrefix} ping response`, response.type);
    } else {
      console.warn(`${logPrefix} unexpected response`, response);
    }
  });
};
