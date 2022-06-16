import { BadRequestException, Injectable } from '@nestjs/common';
import { ParserDto } from './dto/parser.dto';
import { OpfService } from './services/opf.service';
import { NcxService } from './services/ncx.service';
import { StreamZipAsync } from 'node-stream-zip';
import * as StreamZip from 'node-stream-zip';
import { TextService } from './services/text.service';
import { getRootPath } from '../helpers/rootPath';
import { Metadata } from './types/metadata.type';
import { OpfObject } from '../../types/opf/opf.type';
import { parseXml } from './xml/xml-parser';
import { MetadataService } from './services/opf/metadata.service';
import { ManifestService } from './services/opf/manifest.service';
import * as fs from 'fs-extra';
import { Manifest, ManifestItem } from '../../types/manifest.type';
import { Spine } from '../../types/spine.type';

@Injectable()
export class ParserService {
  constructor(
    private opf: OpfService,
    private metadataService: MetadataService,
    private manifestService: ManifestService,
    private tocService: NcxService,
    private textService: TextService,
  ) {}

  async create(parserDto: ParserDto) {
    const { ref_id, section } = parserDto;
    const rootPath = getRootPath(ref_id);
    const opfPath: string = await this.getOpfFilePath(rootPath);
    const opfObject: OpfObject = await parseXml(opfPath);

    const metadata: Metadata = await this.opf.metadataService.processMetadata(
      opfObject.package.metadata,
    );
    const manifest: Manifest = await this.opf.manifestService.processManifest(
      opfObject.package.manifest,
    );
    const spine: Spine = await this.opf.spineService.processSpine(
      opfObject.package.spine,
    );
    const guide: Guide = await this.opf.guideService.processGuide(
      opfObject.package.guide,
    );

    const orderedManifestText = this.orderManifestItems(manifest.text, spine);

    /*
     * STEPS
     * - Reach into Table of Contens defined in the guide
     * - Grab the ids, and remove ANY other unnecessary IDs
     * - Find way to reach into corresponding HTML file. The IDs must be accurate in some way
     * */

    this.textService.assignText(ref_id, orderedManifestText[section]);

    const data = { rootPath, metadata, orderedManifestText };

    return data;
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

  private async saveDocument() {
    return;
  }

  private async unzipEpub(path: string, ref_id: string) {
    const zip: StreamZipAsync = new StreamZip.async({
      file: path,
      storeEntries: true,
    });
    try {
      await zip.extract(null, path);
    } catch (error) {
      console.log('ERROR:', error);
    }
  }
}
