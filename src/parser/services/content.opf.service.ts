import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs-extra';
import { Metadata, MetadataIdentifiers } from '../types/metadata.type';
import { parser, readXml } from '../xml/xml-parser';

@Injectable()
export class ContentOpfService {
  async processContentOpf(rootPath: string) {
    const contentOpfPath = await this.getContentOpfPath(rootPath);
    const contentOpfObj = await readXml(contentOpfPath);
    const metadata = await this.processContentOpfObj(contentOpfObj);
    return metadata;
  }

  // private

  private async getContentOpfPath(rootPath: string): Promise<string> {
    const containerXMLPath = rootPath + '/META-INF/container.xml';
    if (!fs.pathExists(containerXMLPath))
      throw new BadRequestException('Cannot find container.xml path');

    const XML = await fs.readFile(containerXMLPath, 'utf8');
    const containerXMLObj = await parser.parse(XML);
    const contentOpfDir =
      containerXMLObj?.container?.rootfiles?.rootfile['full-path'];
    if (!contentOpfDir)
      throw new BadRequestException('Cannot find content.opf directory');
    return rootPath + '/' + contentOpfDir;
  }

  private async processContentOpfObj(contentOpfObj: any) {
    const metadataObj = contentOpfObj?.package?.metadata;
    const metadata = this.mapMetadata(metadataObj);
    return metadata;
  }

  private mapMetadata(metaData: any): Metadata {
    const map = {};
    map['title'] = metaData['dc:title'];
    map['language'] = metaData['dc:language'];
    map['author'] = metaData['dc:creator']['#text'];
    map['subjects'] = metaData['dc:subject'];
    map['publisher'] = metaData['dc:publisher'];
    map['description_html'] = metaData['dc:description'];
    map['date_published'] = metaData['dc:date'];

    const identifiers = this.getIdentifiers(metaData['dc:identifier']);
    return { ...map, ...identifiers } as Metadata;
  }

  private getIdentifiers(identifiers: Array<any>) {
    const id_key = '#text';
    const identifiersObj = {};
    identifiers.map((id) => {
      const scheme = this.mapOpfScheme(id['opf:scheme']);
      identifiersObj[scheme] = id[id_key];
    });

    return identifiersObj as MetadataIdentifiers;
  }

  private mapOpfScheme(scheme: string) {
    switch (scheme.toLowerCase()) {
      case 'isbn':
        return 'isbn';
      case 'mobi-asin':
        return 'mobi_asin';
      case 'uuid':
        return 'uuid';
      default:
        return undefined;
    }
  }
}
