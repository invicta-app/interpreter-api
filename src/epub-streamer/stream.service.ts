import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as StreamZip from 'node-stream-zip';
import { StreamDto } from './dto/stream.dto';
import { processXml } from '../xml/xml-processor';
import { OpfObject } from '../types/opf/opf.type';
import { Metadata } from '../types/metadata.types';
import { Manifest, ManifestItem } from '../types/manifest.types';
import { Spine } from '../types/spine.type';
import { Guide } from '../types/guide.types';
import { OpfService } from '../opf/services/opf.service';
import { SectionService } from '../services/section.service';
import { ISection } from '../types/section.interface';
import { getRootPath } from '../helpers/rootPath';
import { getOpfFilePath } from '../helpers/getOpfFilePath';

@Injectable()
export class StreamService {
  constructor(
    private opf: OpfService,
    private sectionService: SectionService,
  ) {}

  async streamEpub(streamDto: StreamDto) {
    const { volume_id, order } = streamDto;
    const epub = await this.epubStream(volume_id);
    const entries = this.formatEntries(await epub.entries());

    const containerBuffer = await epub.entryData('META-INF/container.xml');
    const containerXml: string = containerBuffer.toString();
    const opfPath: any = await getOpfFilePath(containerXml);
    const opfBuffer = await epub.entryData(opfPath);
    const opfXml = opfBuffer.toString();

    const opfObject: OpfObject = await processXml(opfXml);

    const metadata: Metadata = await this.opf.metadataService.processMetadata(
      opfObject.package.metadata,
    );
    const manifest: Manifest = await this.opf.manifestService.processManifest(
      opfObject.package.manifest,
    );
    const spine: Spine = await this.opf.spineService.processSpine(
      opfObject.package.spine,
    );
    const guide: Guide = await this.opf.guideService.getTocHref(
      opfObject.package.guide,
    );

    const orderedManifest = this.orderManifestItems(manifest.text, spine);
    const volume: Array<ISection> = [];

    const x = await Promise.all(
      orderedManifest.map(async (item) => {
        const filePath = this.getFilePath(volume_id, item.href, entries);
        const fileBuffer = await epub.entryData(filePath);
        const fileAsString = fileBuffer.toString();
        const section = await this.sectionService.createSection(
          item,
          fileAsString,
        );
        volume.push(section);
      }),
    );

    orderedManifest.forEach((item) => {
      const filePath = this.getFilePath(volume_id, item.href, entries);
      const fileBuffer = epub.entryData(filePath);
      const fileAsString = fileBuffer.toString();
      this.sectionService
        .createSection(item, fileAsString)
        .then((section) => volume.push(section));
    });

    return { metadata, manifest, spine, guide, volume };
  }

  private getFilePath(volume_id: string, href: string, entries: Array<string>) {
    const relativePath = entries.find((entry) => entry.endsWith(href));
    const path = getRootPath(`${volume_id}/${relativePath}`);
    if (path) return path;
    else throw new InternalServerErrorException('Error with EPUB document...');
  }

  private formatEntries(entries: any) {
    const entriesArr: Array<string> = [];
    for (const [key] of Object.entries(entries)) {
      entriesArr.push(key);
    }
    return entriesArr;
  }

  private async epubStream(book_id: string) {
    const path = getRootPath(book_id);
    try {
      const zip = await new StreamZip.async({
        file: path,
        storeEntries: true,
      });
      return zip;
    } catch (err) {
      console.log('Error extracting EPUB: ', err);
      throw new InternalServerErrorException(err.message);
    }
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
}
