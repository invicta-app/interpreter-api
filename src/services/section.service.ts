import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getRootPath } from '../helpers/rootPath';
import { ManifestItem } from '../types/manifest.types';
import * as fs from 'fs-extra';
import { parseXml } from '../xml/xml-parser';
import { ISection } from '../types/section.interface';
import { processXml } from '../xml/xml-processor';

@Injectable()
export class SectionService {
  async createSection(item: ManifestItem, fileAsString: string) {
    const xml = await processXml(fileAsString);

    const section: ISection = {
      id: item.id,
      text: fileAsString.replace(/(\r\n|\n|\r)/gm, ''),
      body_id: xml?.html?.body?.id,
      body_class: xml?.html?.body?.class,
      position: item.order,
    };

    return section as ISection;
  }
}
