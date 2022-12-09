import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as StreamZip from 'node-stream-zip';
import { processXml } from '../helpers/xml-processor';
import { OpfObject } from '../types/opf/opf.type';
import { Metadata } from '../types/metadata.types';
import { Manifest, ManifestItem } from '../types/manifest.types';
import { Spine } from '../types/spine.type';
import { Guide } from '../types/guide.types';
import { OpfService } from '../modules/opf/services/opf.service';
import { SectionService } from '../services/section.service';
import { ISection } from '../types/section.interface';
import { getRootPath } from '../helpers/rootPath';
import { getOpfFilePath } from '../helpers/getOpfFilePath';
import { SectionDto } from '../dto/section.dto';
import { EpubService } from '../modules/epub/epub.service';

@Injectable()
export class StreamService {
  constructor(
    private opf: OpfService,
    private epub: EpubService,
    private sectionService: SectionService,
  ) {}

  async streamVolume(volume_id: string) {
    const epub = await this.epub.stream(volume_id);
    const entries = this.epub.formatEntries(await epub.entries());

    const { metadata, manifest, spine, guide } = await this.epub.process(epub);

    const orderedManifest = this.epub.orderManifestItems(manifest.text, spine);
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
    const epub = await this.epub.stream(volume_id);
    const entries = this.epub.formatEntries(await epub.entries());

    const { manifest, spine } = await this.epub.process(epub);

    const orderedManifest = this.epub.orderManifestItems(manifest.text, spine);

    const section = orderedManifest.find(
      (item) => item.order == section_number,
    );

    if (!section)
      throw new BadRequestException(
        `Section ${section_number} not found in the requested resource.`,
      );

    const entry = entries.find((entry) => entry.endsWith(section.href));
    const fileBuffer = await epub.entryData(entry);
    const fileAsString = fileBuffer.toString();

    return this.sectionService.createSection(section, fileAsString);
  }
}
