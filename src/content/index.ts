import { MessageType } from '../background/messages';
import type { PingRequest, PingResponse } from '../shared/types';
import { startFocusTracking } from './focus';
import { startContentSettingsListener, startSettingsListener } from './state';
import { initWidget } from './ui/widget';

declare global {
  interface Window {
    __jobfill_initialized?: boolean;
  }
}

// Prevent multiple initializations
if (!window.__jobfill_initialized) {
  window.__jobfill_initialized = true;

  const ping: PingRequest = { type: MessageType.PING };

  chrome.runtime.sendMessage(ping, (response: PingResponse) => {
    if (response?.type === MessageType.PING && response.ok) {
      console.debug('JobFill extension received PING response.');
    }
  });

  startFocusTracking();
  startSettingsListener();
  startContentSettingsListener();
  initWidget();
}
