import type { FieldElement } from '../../shared/types';

const ALLOWED_INPUT_TYPES = new Set([
  'text',
  'email',
  'tel',
  'url',
  'number',
  'search',
  'password',
]);

const isHiddenByAncestor = (element: HTMLElement): boolean => {
  let current: HTMLElement | null = element;
  while (current) {
    if (current.hasAttribute('hidden') || current.getAttribute('aria-hidden') === 'true') {
      return true;
    }
    const style = window.getComputedStyle(current);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
};

const isElementVisible = (element: HTMLElement): boolean => {
  if (isHiddenByAncestor(element)) {
    return false;
  }
  return element.getClientRects().length > 0;
};

const isAllowedInput = (element: HTMLInputElement): boolean => {
  const type = element.type?.toLowerCase() ?? 'text';
  return ALLOWED_INPUT_TYPES.has(type);
};

export const isFillableElement = (element: Element): element is FieldElement => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (!isElementVisible(element)) {
    return false;
  }

  if (element instanceof HTMLInputElement) {
    if (element.disabled || element.readOnly) {
      return false;
    }
    return isAllowedInput(element);
  }

  if (element instanceof HTMLTextAreaElement) {
    return !(element.disabled || element.readOnly);
  }

  if (element instanceof HTMLSelectElement) {
    return !element.disabled;
  }

  return element.isContentEditable;
};

export const getFillableFields = (root: ParentNode = document.body): FieldElement[] => {
  const fields: FieldElement[] = [];
  if (!root) {
    return fields;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let current = walker.currentNode as Element | null;

  while (current) {
    if (isFillableElement(current)) {
      fields.push(current);
    }
    current = walker.nextNode() as Element | null;
  }

  return fields;
};

export const focusNextField = (current: FieldElement): FieldElement | null => {
  const fields = getFillableFields();
  const index = fields.findIndex((field) => field === current);
  if (index === -1) {
    return null;
  }

  const next = fields[index + 1];
  if (!next) {
    return null;
  }

  if (next instanceof HTMLElement) {
    next.focus();
  }

  return next;
};

export const waitForSelectChange = (
  element: HTMLSelectElement,
  timeoutMs = 500,
): Promise<void> => {
  return new Promise((resolve) => {
    let settled = false;

    const done = () => {
      if (settled) {
        return;
      }
      settled = true;
      element.removeEventListener('change', done);
      resolve();
    };

    element.addEventListener('change', done, { once: true });
    window.setTimeout(done, timeoutMs);
  });
};
