const dispatchInputAndChange = (element: HTMLElement): void => {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

export const setContentEditableValue = (element: HTMLElement, value: string): void => {
  const selection = window.getSelection();
  const range = document.createRange();

  range.selectNodeContents(element);
  range.collapse(false);
  selection?.removeAllRanges();
  selection?.addRange(range);

  element.textContent = value;

  dispatchInputAndChange(element);
};
