const getNativeSelectValueSetter = (
  element: HTMLSelectElement,
): ((value: string) => void) | null => {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor?.set) {
    return descriptor.set.bind(element) as (value: string) => void;
  }
  return null;
};

const dispatchInputAndChange = (element: HTMLSelectElement): void => {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

export const setSelectValue = (element: HTMLSelectElement, value: string): void => {
  const setter = getNativeSelectValueSetter(element);
  if (setter) {
    setter(value);
  } else {
    element.value = value;
  }

  if (element.value !== value) {
    const option = Array.from(element.options).find((item) => item.value === value);
    if (option) {
      option.selected = true;
    }
  }

  dispatchInputAndChange(element);
};
