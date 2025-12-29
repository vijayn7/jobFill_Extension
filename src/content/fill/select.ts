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

const normalizeOptionValue = (value: string): string => value.trim().toLowerCase();

const findMatchingOption = (
  element: HTMLSelectElement,
  value: string,
): HTMLOptionElement | undefined => {
  const normalized = normalizeOptionValue(value);
  return Array.from(element.options).find((option) => {
    return (
      normalizeOptionValue(option.value) === normalized ||
      normalizeOptionValue(option.text) === normalized
    );
  });
};

export const setSelectValue = (element: HTMLSelectElement, value: string): void => {
  const matchingOption = findMatchingOption(element, value);
  const targetValue = matchingOption ? matchingOption.value : value;
  const setter = getNativeSelectValueSetter(element);
  if (setter) {
    setter(targetValue);
  } else {
    element.value = targetValue;
  }

  if (matchingOption && element.value !== matchingOption.value) {
    matchingOption.selected = true;
  }

  dispatchInputAndChange(element);
};
