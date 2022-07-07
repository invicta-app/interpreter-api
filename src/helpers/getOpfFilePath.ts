import { processXml } from '../xml/xml-processor';

export const getOpfFilePath = async (containerXml: string) => {
  const xml = await processXml(containerXml);
  const opf = xml?.container?.rootfiles.rootfile;
  return opf['full-path'];
};
