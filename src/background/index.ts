import { MessageType } from './messages';
import type { BackgroundMessage, BackgroundResponse } from './messages';

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  if (message.type === MessageType.PING) {
    const response: BackgroundResponse = { type: MessageType.PING, ok: true };
    sendResponse(response);
  }
});
