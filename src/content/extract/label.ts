export const getLabelText = (element: Element): string | null => {
  return element.getAttribute('aria-label');
};
