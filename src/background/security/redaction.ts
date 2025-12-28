export const redactSensitive = (value: string): string => {
  return value.replace(/\d/g, '*');
};
