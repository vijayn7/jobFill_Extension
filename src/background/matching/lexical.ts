export const lexicalScore = (a: string, b: string): number => {
  if (!a || !b) {
    return 0;
  }
  return a === b ? 1 : 0;
};
