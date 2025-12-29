import type { FieldContext, FieldElement } from '../../shared/types';
import { getFieldIdentifiers } from './fingerprint';
import {
  getAriaLabel,
  getAriaLabelledBy,
  getLabelForAttribute,
  getNearbyText,
  getPlaceholderText,
  getWrappedLabel,
  getWrapperHeuristicLabel,
} from './label';
import { getSectionHeading } from './section';

const isRequired = (element: FieldElement): boolean | undefined => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.required || element.getAttribute('aria-required') === 'true';
  }

  if (element instanceof HTMLSelectElement) {
    return element.required || element.getAttribute('aria-required') === 'true';
  }

  return element.getAttribute('aria-required') === 'true';
};

const getMaxLength = (element: FieldElement): number | undefined => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.maxLength > 0 ? element.maxLength : undefined;
  }
  const raw = element.getAttribute('maxlength');
  if (!raw) {
    return undefined;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const getPattern = (element: FieldElement): string | undefined => {
  if (element instanceof HTMLInputElement) {
    return element.pattern || undefined;
  }

  return element.getAttribute('pattern') || undefined;
};

const getInputType = (element: FieldElement): string | undefined => {
  if (element instanceof HTMLInputElement) {
    return element.type || 'text';
  }

  if (element instanceof HTMLTextAreaElement) {
    return 'textarea';
  }

  if (element instanceof HTMLSelectElement) {
    return 'select';
  }

  if (element.isContentEditable) {
    return 'contenteditable';
  }

  return undefined;
};

const getSelectOptions = (element: FieldElement): string[] | undefined => {
  if (!(element instanceof HTMLSelectElement)) {
    return undefined;
  }

  const options = Array.from(element.options)
    .map((option) => option.text.trim())
    .filter((text) => text.length > 0);

  return options.length > 0 ? options : undefined;
};

const getQuestionText = (
  element: HTMLElement,
  sectionHeading: string | undefined,
  nearbyText: string | undefined,
): string | undefined =>
  getLabelForAttribute(element) ||
  getWrappedLabel(element) ||
  getAriaLabel(element) ||
  getAriaLabelledBy(element) ||
  getWrapperHeuristicLabel(element) ||
  getPlaceholderText(element) ||
  sectionHeading ||
  nearbyText;

export const buildFieldContext = (element: FieldElement): FieldContext => {
  const identifiers = getFieldIdentifiers(element);
  const sectionHeading = getSectionHeading(element);
  const nearbyText = getNearbyText(element);
  const questionText = getQuestionText(element, sectionHeading, nearbyText);

  const baseContext: FieldContext = {
    ...identifiers,
    label: questionText,
    question_text: questionText,
    section_heading: sectionHeading,
    nearby_text: nearbyText,
    placeholder: getPlaceholderText(element),
    required: isRequired(element),
    maxlength: getMaxLength(element),
    pattern: getPattern(element),
    input_type: getInputType(element),
    select_options: getSelectOptions(element),
    url: window.location.href,
    domain: window.location.hostname,
    page_title: document.title,
  };

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement
  ) {
    baseContext.value = element.value;
  } else if (element.isContentEditable) {
    baseContext.value = element.textContent?.trim() || undefined;
  }

  return baseContext;
};
