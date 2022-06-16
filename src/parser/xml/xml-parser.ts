import { X2jOptionsOptional, XMLParser } from 'fast-xml-parser';
import * as fs from 'fs-extra';

export const createParser = (opts?: X2jOptionsOptional) => {
  return new XMLParser({
    ignoreAttributes: false,
    ignoreDeclaration: true,
    allowBooleanAttributes: true,
    attributeNamePrefix: '',
    textNodeName: 'text',
    ...opts,
  });
};

export const parseXml = async (
  path: string,
  opts: X2jOptionsOptional = {},
  ascii = 'utf8',
): Promise<any> => {
  const parser = createParser(opts);
  const xml = await fs.readFile(path, ascii);
  return await parser.parse(xml);
};
