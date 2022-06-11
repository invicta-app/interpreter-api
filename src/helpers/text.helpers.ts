// WARNING: must use parseXmlText
import { isArray, isObject } from './validatePrimitives';

/**
 * @param {any} obj Searches for '.text' extension in nested Arrays/Objects
 */
export const getText = (obj): string => {
  if (!obj) return '';
  let text = '';
  if (isArray(obj)) obj.forEach((item) => (text += getText(item)));
  else if (isObject(obj)) {
    if (obj.text) return obj.text;
    for (const key in obj) text += getText(obj[key]);
  } else return text;
  return text;
};
