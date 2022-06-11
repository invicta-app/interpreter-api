import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import { Section } from '../types/toc.ncx.types';
import { parseXml } from '../xml/xml-parser';
import { TextService } from './text.service';

/**
 * toc.ncx => Table of Contents, Navigation Control for XML
 */

@Injectable()
export class NcxService {
  constructor(private textService: TextService) {}

  async processTocNcx(rootPath: string): Promise<Section[]> {
    const tocNcxPath = await this.getTocNcxPath(rootPath);
    const tocNcxObj = await parseXml(tocNcxPath);
    const navigationPoint = tocNcxObj?.ncx?.navMap?.navPoint;
    const tableOfContents = await this.processNavigationPoint(navigationPoint);
    return tableOfContents;
  }

  // private

  private async getTocNcxPath(rootPath: string): Promise<string> {
    const tocNcxPath = rootPath + '/toc.ncx';
    if (!fs.pathExists(tocNcxPath))
      throw new BadRequestException('Cannot find toc.ncx file');
    return tocNcxPath;
  }

  private processNavigationPoint(navigationPoint: any, parent?: string): any {
    let tableOfContents: Section[] = [];
    for (const item of navigationPoint) {
      if (item.navPoint) {
        const sections: Section[] = this.processNavigationPoint(
          item.navPoint,
          item.navLabel.text,
        );
        tableOfContents.push(sections as any);
        tableOfContents = tableOfContents.flat();
      } else {
        const section: Section = this.processItem(item, parent);
        tableOfContents.push(section);
      }
    }
    return tableOfContents;
  }

  private processItem(item: any, parent?: string): Section {
    if (item.navPoint) return;
    const mapped_item: Section = {
      parent,
      section_title: item?.navLabel?.text,
      content_directory: item?.content?.src,
      section_type: item?.class,
      section_number: item?.id,
      play_order: item?.playOrder,
    };
    return mapped_item as Section;
  }
}
