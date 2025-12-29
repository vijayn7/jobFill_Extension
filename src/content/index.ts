import { MessageType } from '../background/messages';
import type { PingRequest, PingResponse } from '../shared/types';
import { startFocusTracking } from './focus';

const ping: PingRequest = { type: MessageType.PING };

chrome.runtime.sendMessage(ping, (response: PingResponse) => {
  if (response?.type === MessageType.PING && response.ok) {
    console.debug('JobFill extension received PING response.');
  }
});

startFocusTracking();
