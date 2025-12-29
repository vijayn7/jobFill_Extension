import { buildSearchText, normalizeText } from './normalize';

export const tokenize = (value: string): string[] => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }
  return normalized.split(' ').filter(Boolean);
};

export const jaccardSimilarity = (a: string[], b: string[]): number => {
  if (a.length === 0 && b.length === 0) {
    return 1;
  }
  if (a.length === 0 || b.length === 0) {
    return 0;
  }

  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;

  setA.forEach((token) => {
    if (setB.has(token)) {
      intersection += 1;
    }
  });

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
};

export const trigramTokens = (value: string): string[] => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }
  const padded = `  ${normalized} `;
  const grams: string[] = [];

  for (let i = 0; i < padded.length - 2; i += 1) {
    grams.push(padded.slice(i, i + 3));
  }

  return grams;
};

export const trigramSimilarity = (a: string, b: string): number => {
  const gramsA = trigramTokens(a);
  const gramsB = trigramTokens(b);

  if (gramsA.length === 0 && gramsB.length === 0) {
    return 1;
  }
  if (gramsA.length === 0 || gramsB.length === 0) {
    return 0;
  }

  const freqA = new Map<string, number>();
  const freqB = new Map<string, number>();

  gramsA.forEach((gram) => {
    freqA.set(gram, (freqA.get(gram) ?? 0) + 1);
  });
  gramsB.forEach((gram) => {
    freqB.set(gram, (freqB.get(gram) ?? 0) + 1);
  });

  let intersection = 0;
  let total = 0;

  freqA.forEach((countA, gram) => {
    const countB = freqB.get(gram) ?? 0;
    intersection += Math.min(countA, countB);
    total += countA;
  });

  freqB.forEach((countB, gram) => {
    if (!freqA.has(gram)) {
      total += countB;
    }
  });

  return total === 0 ? 0 : intersection / total;
};

export const buildQueryTokens = (parts: Array<string | null | undefined>) => {
  const text = buildSearchText(parts);
  return {
    text,
    tokens: tokenize(text),
  };
};
