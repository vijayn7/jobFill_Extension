const NON_WORD_REGEX = /[^a-z0-9]+/g;

export const normalizeText = (value: string): string => {
  const lowered = value.toLowerCase();
  const cleaned = lowered.replace(NON_WORD_REGEX, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
};

export const tokenizeText = (value: string): string[] => {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(' ') : [];
};

export const buildSearchText = (parts: Array<string | null | undefined>): string => {
  return normalizeText(parts.filter(Boolean).join(' '));
};
