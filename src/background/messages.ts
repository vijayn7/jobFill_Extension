import type { PingMessage, PongResponse } from '../shared/types';

const isPingMessage = (message: unknown): message is PingMessage => {
  return typeof message === 'object' && message !== null && 'type' in message && message.type === 'PING';
};

export const initializeBackground = (): void => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (isPingMessage(message)) {
      const response: PongResponse = { type: 'PONG' };
      sendResponse(response);
    }
  });
};
