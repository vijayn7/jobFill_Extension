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

const parseCheckedValue = (value: string): boolean | null => {
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on', 'checked'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off', 'unchecked'].includes(normalized)) {
    return false;
  }
  return null;
};

const normalizeMatchValue = (value: string): string => value.trim().toLowerCase();

const getRadioGroup = (element: HTMLInputElement): HTMLInputElement[] => {
  const name = element.name;
  const selector = name
    ? `input[type="radio"][name="${CSS.escape(name)}"]`
    : 'input[type="radio"]';
  const scope = element.closest('fieldset, form, [role="radiogroup"]') ?? document.documentElement;
  return Array.from(scope.querySelectorAll(selector)).filter(
    (item): item is HTMLInputElement => item instanceof HTMLInputElement,
  );
};

const getRadioLabel = (element: HTMLInputElement): string | undefined => {
  const label =
    document.querySelector(`label[for="${CSS.escape(element.id)}"]`) ||
    element.closest('label');
  return label?.textContent?.trim() || undefined;
};

const setRadioValue = (element: HTMLInputElement, value: string): boolean => {
  const normalizedValue = normalizeMatchValue(value);
  const radios = getRadioGroup(element);
  const match = radios.find((radio) => {
    const radioValue = normalizeMatchValue(radio.value);
    const labelValue = getRadioLabel(radio);
    return (
      radioValue === normalizedValue ||
      normalizeMatchValue(labelValue ?? '') === normalizedValue
    );
  });

  if (!match) {
    return false;
  }

  const checkedSetter = getNativeCheckedSetter(match);
  if (checkedSetter) {
    checkedSetter(true);
  } else {
    match.checked = true;
  }
  dispatchInputAndChange(match);
  return true;
};

export const setInputValue = (
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void => {
  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      if (type === 'radio' && setRadioValue(element, value)) {
        return;
      }

      const checkedValue = parseCheckedValue(value);
      if (checkedValue !== null) {
        const checkedSetter = getNativeCheckedSetter(element);
        if (checkedSetter) {
          checkedSetter(checkedValue);
        } else {
          element.checked = checkedValue;
        }
        dispatchInputAndChange(element);
      }
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
