import { MessageType } from './messages';
import type { BackgroundMessage, BackgroundResponse } from './messages';
import { handleSaveAnswer } from './handlers/saveAnswer';

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  if (message.type === MessageType.PING) {
    const response: BackgroundResponse = { type: MessageType.PING, ok: true };
    sendResponse(response);
    return;
  }

  if (message.type === MessageType.SAVE_ANSWER) {
    handleSaveAnswer(message).then(sendResponse);
    return true;
  }
});
