import { Injectable, BadRequestException } from '@nestjs/common';
import { Metadata, MetadataIdentifiers } from '../types/metadata.type';
import { parseXml } from '../xml/xml-parser';
import {
  Opf,
  OpfManifest,
  OpfManifestItem,
  OpfMetadata,
} from '../../../types/opf/opf.type';
import { splitHtmlHref } from '../../helpers/splitHtmlHref';
import { getText } from '../../helpers/text.helpers';
import * as fs from 'fs-extra';
import { TextService } from './text.service';

export interface DelegatedManifest {
  text?: Array<any>;
  css?: Array<any>;
  image?: Array<any>;
  font?: Array<any>;
}

export enum ManifestFormats {
  TEXT = 'application/xhtml+xml',
  CSS = 'text/css',
  IMAGE = 'image/jpeg',
  FONT = 'application/vnd.ms-opentype',
}

@Injectable()
export class OpfService {
  constructor(private textService: TextService) {}

  getTocHref(opfObject: Opf): string {
    return opfObject?.package?.guide?.reference?.find(
      (ref) => ref.type === 'toc',
    ).href;
  }

  async getOpfPath(rootPath: string): Promise<string> {
    try {
      const containerXMLPath = rootPath + '/META-INF/container.xml';
      if (!fs.pathExists(containerXMLPath)) throw 'Cannot find container.xml';

      const XML = await parseXml(containerXMLPath);
      const opfDirectory = XML?.container?.rootfiles?.rootfile['full-path'];

      if (!opfDirectory) throw 'Cannot find content.opf directory';
      return `${rootPath}/${opfDirectory}`;
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  private mapTocSection(section: any) {
    const title = getText(section?.a);
    if (!title) return;
    const { href_path, href_id } = splitHtmlHref(section?.a?.href);
    const parent_css_class = section?.class;
    const child_css_class = section?.a?.class;
    return {
      title,
      href: href_path,
      href_id,
      parent_css_class,
      child_css_class,
    };
  }
}
