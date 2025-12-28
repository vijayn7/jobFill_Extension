import type { MessageRequestMap, MessageResponseMap, MessageType } from '../background/messages';

type ChromeRuntime = {
  sendMessage: (message: unknown, callback: (response: unknown) => void) => void;
  lastError?: { message?: string };
};

type ChromeGlobal = typeof globalThis & {
  chrome?: {
    runtime?: ChromeRuntime;
  };
};

export const sendBackgroundMessage = <T extends MessageType>(
  request: MessageRequestMap[T],
): Promise<MessageResponseMap[T]> => {
  const runtime = (globalThis as ChromeGlobal).chrome?.runtime;
  if (!runtime) {
    return Promise.reject(new Error('Chrome runtime is unavailable.'));
  }

  return new Promise((resolve, reject) => {
    runtime.sendMessage(request, (response) => {
      if (runtime.lastError) {
        reject(new Error(runtime.lastError.message ?? 'Unknown runtime error.'));
        return;
      }

      resolve(response as MessageResponseMap[T]);
    });
  });
};
