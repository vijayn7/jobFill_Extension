const whitespaceRegex = /\s+/g;
const maxNearbyChars = 200;

const cleanText = (text: string | null | undefined): string | undefined => {
  if (!text) {
    return undefined;
  }
  const cleaned = text.replace(whitespaceRegex, ' ').trim();
  return cleaned.length > 0 ? cleaned : undefined;
};

const getElementText = (element: Element | null): string | undefined =>
  cleanText(element?.textContent);

const getLabelTextByIds = (ids: string): string | undefined => {
  const parts = ids
    .split(/\s+/)
    .map((id) => getElementText(document.getElementById(id)))
    .filter((value): value is string => Boolean(value));

  return parts.length > 0 ? parts.join(' ') : undefined;
};

export const getLabelForAttribute = (element: HTMLElement): string | undefined => {
  if (!element.id) {
    return undefined;
  }

  const selector = `label[for="${CSS.escape(element.id)}"]`;
  return getElementText(document.querySelector(selector));
};

export const getWrappedLabel = (element: HTMLElement): string | undefined =>
  getElementText(element.closest('label'));

export const getAriaLabel = (element: HTMLElement): string | undefined =>
  cleanText(element.getAttribute('aria-label'));

export const getAriaLabelledBy = (element: HTMLElement): string | undefined => {
  const labelledBy = element.getAttribute('aria-labelledby');
  if (!labelledBy) {
    return undefined;
  }

  return getLabelTextByIds(labelledBy);
};

export const getWrapperHeuristicLabel = (element: HTMLElement): string | undefined => {
  let current: HTMLElement | null = element;
  let steps = 0;

  while (current && steps < 4) {
    const label =
      current.querySelector('label') ||
      current.querySelector('legend') ||
      current.querySelector('span') ||
      current.querySelector('p');

    const labelText = getElementText(label);
    if (labelText) {
      return labelText;
    }

    current = current.parentElement;
    steps += 1;
  }

  return undefined;
};

export const getPlaceholderText = (element: HTMLElement): string | undefined => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return cleanText(element.placeholder);
  }

  return cleanText(element.getAttribute('placeholder'));
};

export const getNearbyText = (element: HTMLElement): string | undefined => {
  const parent = element.parentElement;
  if (!parent) {
    return undefined;
  }

  const texts: string[] = [];
  parent.childNodes.forEach((node) => {
    if (node === element) {
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = cleanText(node.textContent);
      if (text) {
        texts.push(text);
      }
      return;
    }

    if (node instanceof HTMLElement) {
      if (
        node.matches('input, textarea, select, [contenteditable="true"], button')
      ) {
        return;
      }
      const text = getElementText(node);
      if (text) {
        texts.push(text);
      }
    }
  });

  if (texts.length === 0) {
    return undefined;
  }

  const combined = texts.join(' ');
  const trimmed = combined.length > maxNearbyChars ? combined.slice(0, maxNearbyChars) : combined;
  return cleanText(trimmed);
};
