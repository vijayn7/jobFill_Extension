import type { FieldContext, FieldElement } from '../../shared/types';

export const getFieldIdentifiers = (element: FieldElement): Pick<FieldContext, 'id' | 'name'> => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return {
      id: element.id || undefined,
      name: element.name || undefined,
    };
  }

  if (element instanceof HTMLSelectElement) {
    return {
      id: element.id || undefined,
      name: element.name || undefined,
    };
  }

  return {
    id: element.id || undefined,
    name: element.getAttribute('name') || undefined,
  };
};
