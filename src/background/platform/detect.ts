export const detectPlatform = (url: string): string => {
  if (url.includes('greenhouse')) {
    return 'greenhouse';
  }
  if (url.includes('lever')) {
    return 'lever';
  }
  if (url.includes('workday')) {
    return 'workday';
  }
  return 'other';
};
