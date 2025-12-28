const cache = new Map<string, number>();

export const getCachedScore = (key: string): number | undefined => cache.get(key);

export const setCachedScore = (key: string, value: number): void => {
  cache.set(key, value);
};
