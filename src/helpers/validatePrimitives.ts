export const isArray = (obj: any): boolean => Array.isArray(obj);

export const isObject = (obj: any): boolean => {
  return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
};
