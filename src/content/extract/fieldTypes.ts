import type { FieldElement } from '../../shared/types';

const fieldSelectors = ['input', 'textarea', 'select', '[contenteditable="true"]'];

export const isSupportedField = (element: EventTarget | null): element is FieldElement => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (element instanceof HTMLInputElement) {
    return element.type !== 'hidden';
  }

  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return true;
  }

  return element.matches('[contenteditable="true"]');
};

export const isFieldElement = (element: EventTarget | null): element is FieldElement => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (isSupportedField(element)) {
    return true;
  }

  const match = element.closest(fieldSelectors.join(','));
  return match instanceof HTMLElement && isSupportedField(match);
};

export const normalizeFieldElement = (element: EventTarget | null): FieldElement | null => {
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  if (isSupportedField(element)) {
    return element;
  }

  const match = element.closest(fieldSelectors.join(','));
  return match instanceof HTMLElement && isSupportedField(match) ? match : null;
};
