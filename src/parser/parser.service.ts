import { BadRequestException, Injectable } from '@nestjs/common';
import { ParserDto } from './dto/parser.dto';
import { OpfService } from '../opf/services/opf.service';
import { SectionService } from '../services/section.service';
import { getRootPath } from '../helpers/rootPath';
import { Metadata } from '../types/metadata.types';
import { OpfObject } from '../types/opf/opf.type';
import { parseXml } from '../xml/xml-parser';
import * as fs from 'fs-extra';
import { Manifest, ManifestItem } from '../types/manifest.types';
import { Spine } from '../types/spine.type';
import { Guide } from '../types/guide.types';

@Injectable()
export class ParserService {
  constructor(
    // private opf: OpfService,
    private sectionService: SectionService,
  ) {}

  async create(parserDto: ParserDto) {
    const { ref_id, section } = parserDto;
    const rootPath = getRootPath(ref_id);
    const opfPath: string = await this.getOpfFilePath(rootPath);
    const opfObject: OpfObject = await parseXml(opfPath);

    // const metadata: Metadata = await this.opf.metadataService.processMetadata(
    //   opfObject.package.metadata,
    // );
    // const manifest: Manifest = await this.opf.manifestService.processManifest(
    //   opfObject.package.manifest,
    // );
    // const spine: Spine = await this.opf.spineService.processSpine(
    //   opfObject.package.spine,
    // );
    // const guide: Guide = await this.opf.guideService.getTocHref(
    //   opfObject.package.guide,
    // );

    // const orderedManifestText = this.orderManifestItems(manifest.text, spine);

    // for (const item of orderedManifestText)
    //   this.sectionService.saveText(ref_id, item);
    //
    // const data = { rootPath, metadata, orderedManifestText, guide };

    return;
  }

  private orderManifestItems(
    manifestItems: Array<ManifestItem>,
    spine: Array<{ idref: string }>,
  ) {
    const orderedText = [];
    for (const [index, itemref] of spine.entries()) {
      const next = manifestItems.find((item) => item.id === itemref.idref);
      next.order = index;
      if (!!next) orderedText.push(next);
    }
    return orderedText as Array<ManifestItem>;
  }

  private async getOpfFilePath(rootPath: string): Promise<string> {
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
}
