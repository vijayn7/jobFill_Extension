const getNativeValueSetter = (
  element: HTMLInputElement | HTMLTextAreaElement,
): ((value: string) => void) | null => {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor?.set) {
    return descriptor.set.bind(element) as (value: string) => void;
  }
  return null;
};

const getNativeCheckedSetter = (
  element: HTMLInputElement,
): ((checked: boolean) => void) | null => {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'checked');
  if (descriptor?.set) {
    return descriptor.set.bind(element) as (checked: boolean) => void;
  }
  return null;
};

const dispatchInputAndChange = (element: HTMLElement): void => {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

const parseCheckedValue = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

export const setInputValue = (
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void => {
  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      const checkedSetter = getNativeCheckedSetter(element);
      const checkedValue = parseCheckedValue(value);
      if (checkedSetter) {
        checkedSetter(checkedValue);
      } else {
        element.checked = checkedValue;
      }
      dispatchInputAndChange(element);
      return;
    }
  }

  const setter = getNativeValueSetter(element);
  if (setter) {
    setter(value);
  } else {
    element.value = value;
  }

  dispatchInputAndChange(element);
};
