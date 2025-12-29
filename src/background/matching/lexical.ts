import { normalizeText, tokenizeText } from './normalize';

export const jaccardSimilarity = (left: string, right: string): number => {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);

  if (!normalizedLeft || !normalizedRight) {
    return 0;
  }

  if (normalizedLeft === normalizedRight) {
    return 1;
  }

  const leftTokens = new Set(tokenizeText(normalizedLeft));
  const rightTokens = new Set(tokenizeText(normalizedRight));
  let intersectionCount = 0;

  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) {
      intersectionCount += 1;
    }
  });

  const unionCount = new Set([...leftTokens, ...rightTokens]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
};
