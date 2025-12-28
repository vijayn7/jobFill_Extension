const SENSITIVE_KEYWORDS = ['ssn', 'social security', 'passport', 'dob'];

export const isSensitive = (text: string): boolean => {
  const normalized = text.toLowerCase();
  return SENSITIVE_KEYWORDS.some((keyword) => normalized.includes(keyword));
};
