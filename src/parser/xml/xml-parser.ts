import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs-extra';
import { InternalServerErrorException } from '@nestjs/common';
import { isArray } from '../../helpers/validatePrimitives';

export const parser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  attributeNamePrefix: '',
  textNodeName: 'text',
});

export const textParser = new XMLParser({
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  attributeNamePrefix: '',
  textNodeName: 'text',
  alwaysCreateTextNode: true, // changes the parsing mechanism - better for text
});

export const parseXml = async (path: string, ascii = 'utf8'): Promise<any> => {
  const xml = await fs.readFile(path, ascii);
  return await parser.parse(xml);
};

export const parseXmlText = async (
  path: string,
  ascii = 'utf8',
): Promise<any> => {
  const xml = await fs.readFile(path, ascii);
  return await textParser.parse(xml);
};
