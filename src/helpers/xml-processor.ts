import { X2jOptionsOptional, XMLParser } from 'fast-xml-parser';

export const processXml = async (
  xmlDocument: string,
  opts: X2jOptionsOptional = {},
): Promise<any> => {
  const parser = createParser(opts);
  return await parser.parse(xmlDocument);
};

export const createParser = (opts?: X2jOptionsOptional) => {
  return new XMLParser({
    ignoreAttributes: false,
    ignoreDeclaration: true,
    ignorePiTags: true,
    allowBooleanAttributes: true,
    attributeNamePrefix: '',
    textNodeName: 'text',
    ...opts,
  });
};
