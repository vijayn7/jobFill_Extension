import { MessageType } from './messages';
import type { BackgroundMessage, BackgroundResponse } from './messages';
import { handleBackgroundMessage } from './messageHandler';
import { handleSaveAnswer } from './handlers/saveAnswer';

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
  // Handle PING immediately
  if (message.type === MessageType.PING) {
    const response: BackgroundResponse = { type: MessageType.PING, ok: true };
    sendResponse(response);
    return;
  }

  // Handle SAVE_ANSWER from Task 1
  if (message.type === MessageType.SAVE_ANSWER) {
    handleSaveAnswer(message).then(sendResponse);
    return true;
  }

  // Handle other messages via the message handler from Task 2
  const tabId = _sender.tab?.id;
  handleBackgroundMessage(message, tabId)
    .then((response) => {
      if (response) {
        sendResponse(response);
      }
    })
    .catch((error) => {
      console.error('JobFill background message failed', error);
    });

  return message.type !== MessageType.FIELD_FOCUSED;
});
