import type { BackgroundMessage, BackgroundResponse } from './messages';

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  if (message.type === 'PING') {
    const response: BackgroundResponse = { type: 'PONG' };
    sendResponse(response);
  }

  return true;
});
