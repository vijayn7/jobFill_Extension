import { MessageType } from './messages';
import type { BackgroundMessage } from './messages';
import { handleBackgroundMessage } from './messageHandler';

chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
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
