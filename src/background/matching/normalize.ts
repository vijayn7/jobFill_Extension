export const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const tokenizeText = (value: string): string[] => {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(' ') : [];
};
