import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as StreamZip from 'node-stream-zip';
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
import { SectionDto } from './dto/section.dto';

@Injectable()
export class StreamService {
  constructor(
    private opf: OpfService,
    private sectionService: SectionService,
  ) {}

  async streamVolume(volume_id: string) {
    const epub = await this.epubStream(volume_id);
    const entries = this.formatEntries(await epub.entries());

    const { metadata, manifest, spine, guide } = await this.processEpub(epub);

    const orderedManifest = this.orderManifestItems(manifest.text, spine);
    const volume: Array<ISection> = [];

    for await (const item of orderedManifest) {
      const entry = entries.find((entry) => entry.endsWith(item.href));
      const fileBuffer = await epub.entryData(entry);
      const fileAsString = fileBuffer.toString();

      this.sectionService
        .createSection(item, fileAsString)
        .then((section) => volume.push(section));
    }

    return {
      metadata,
      ordered_manifest: orderedManifest,
      spine,
      guide,
      volume,
    };
  }

  async streamVolumeSection(sectionDto: SectionDto) {
    const { volume_id, section_number } = sectionDto;
    const epub = await this.epubStream(volume_id);
    const entries = this.formatEntries(await epub.entries());

    const { manifest, spine } = await this.processEpub(epub);

    const orderedManifest = this.orderManifestItems(manifest.text, spine);

    const section = orderedManifest.find(
      (item) => item.order == section_number,
    );

    const entry = entries.find((entry) => entry.endsWith(section.href));
    const fileBuffer = await epub.entryData(entry);
    const fileAsString = fileBuffer.toString();

    return this.sectionService.createSection(section, fileAsString);
  }

  private async processEpub(epub) {
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

    return { metadata, manifest, spine, guide };
  }

  private formatEntries(entries: any) {
    const entriesArr: Array<string> = [];
    for (const [key] of Object.entries(entries)) entriesArr.push(key);
    return entriesArr;
  }

  private async epubStream(book_id: string) {
    const path = getRootPath(book_id);
    try {
      return await new StreamZip.async({
        file: path,
        storeEntries: true,
      });
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
