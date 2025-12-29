const whitespaceRegex = /\s+/g;

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
  const values = ids
    .split(/\s+/)
    .map((id) => getElementText(document.getElementById(id)))
    .filter((value): value is string => Boolean(value));

  return values.length > 0 ? values.join(' ') : undefined;
};

export const getSectionHeading = (element: HTMLElement): string | undefined => {
  const fieldset = element.closest('fieldset');
  if (fieldset) {
    const legendText = getElementText(fieldset.querySelector('legend'));
    if (legendText) {
      return legendText;
    }
  }

  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    if (current.hasAttribute('aria-labelledby')) {
      const labelled = getLabelTextByIds(current.getAttribute('aria-labelledby') ?? '');
      if (labelled) {
        return labelled;
      }
    }

    const heading = current.querySelector('h1, h2, h3, h4, h5, h6');
    const headingText = getElementText(heading);
    if (headingText) {
      return headingText;
    }

    current = current.parentElement;
  }

  return undefined;
};
