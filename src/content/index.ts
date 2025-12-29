import type { PingMessage, PongMessage } from '../shared/types';

const ping: PingMessage = { type: 'PING' };

chrome.runtime.sendMessage(ping, (response: PongMessage) => {
  if (response?.type === 'PONG') {
    console.debug('JobFill extension received PONG.');
  }
});
