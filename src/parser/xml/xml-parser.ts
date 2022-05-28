import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs-extra';

export const parser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  attributeNamePrefix: '',
});

export const readXml = async (path: string, ascii = 'utf8') => {
  const xml = await fs.readFile(path, ascii);
  const xmlObj = await parser.parse(xml);
  return xmlObj;
};
