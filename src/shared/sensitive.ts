import type { FieldContext, SensitiveFieldDetection, SensitiveFieldType } from './types';

const toSearchableText = (context: FieldContext): string => {
  return [
    context.question_text,
    context.label,
    context.name,
    context.placeholder,
    context.section_heading,
    context.nearby_text,
    context.id,
    context.input_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const detectMatches = (text: string): SensitiveFieldType[] => {
  const matches: SensitiveFieldType[] = [];

  if (/\b(ssn|social security|social security number)\b/.test(text)) {
    matches.push('ssn');
  }

  if (/\b(dob|date of birth|birth date|birthday)\b/.test(text)) {
    matches.push('dob');
  }

  if (/\bpassport\b/.test(text)) {
    matches.push('passport');
  }

  if (/\b(bank account|routing number|account number|iban|swift)\b/.test(text)) {
    matches.push('bank');
  }

  if (/\b(tax id|tax identification|taxpayer|ein|tin|vat)\b/.test(text)) {
    matches.push('tax_id');
  }

  return matches;
};

export const detectSensitiveField = (context: FieldContext): SensitiveFieldDetection => {
  const text = toSearchableText(context);
  const matches = detectMatches(text);
  return {
    isSensitive: matches.length > 0,
    matches,
  };
};
