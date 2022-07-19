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

    const cleanString = fileAsString.replace(/(\r\n|\n|\r|\t)/gm, '');

    const section: ISection = {
      id: item.id,
      text: fileAsString,
      body_id: xml?.html?.body?.id,
      body_class: xml?.html?.body?.class,
      position: item.order,
    };

    return section as ISection;
  }
}
