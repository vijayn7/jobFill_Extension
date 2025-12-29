import { MessageType } from '../background/messages';
import type { FieldFocusedRequest } from '../shared/types';
import { buildFieldContext } from './extract/context';
import { normalizeFieldElement } from './extract/fieldTypes';

const handleFocusIn = (event: FocusEvent) => {
  const target = normalizeFieldElement(event.target);
  if (!target) {
    return;
  }

  const payload = buildFieldContext(target);
  const message: FieldFocusedRequest = {
    type: MessageType.FIELD_FOCUSED,
    payload: { field: payload },
  };

  chrome.runtime.sendMessage(message);
};

export const startFocusTracking = () => {
  document.addEventListener('focusin', handleFocusIn, true);
};
