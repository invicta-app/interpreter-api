import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SectionService } from '../services/section.service';
import { ISection } from '../types/section.interface';
import { SectionDto } from '../dto/section.dto';
import { EpubService } from '../modules/epub/epub.service';
import axios from 'axios';
import { Metadata } from '../types/metadata.types';

@Injectable()
export class UploadService {
  constructor(
    private epub: EpubService,
    private sectionService: SectionService,
  ) {}

  async uploadVolume(volume_id: string, opts?: { revise_title?: string }) {
    const epub = await this.epub.stream(volume_id);
    const entries = this.epub.formatEntries(await epub.entries());
    const { metadata, manifest, spine, guide } = await this.epub.process(epub);

    const tableOfContents = await this.handleTableOfContents('', epub, entries);

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

    if (opts.revise_title) metadata.title = opts.revise_title;
    const body = { volume, metadata: this.handleMetadata(metadata) };

    return 'Success!';

    // try {
    //   const url = process.env.INVICTA_API + '/volumes/api/v1/books';
    //   const res = await axios.post(url, body);
    //   return res.data;
    // } catch (err) {
    //   throw new InternalServerErrorException(err.message);
    // }
  }

  async updateSection(sectionDto: SectionDto) {
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

  async overwriteVolume(volume_id: string) {}

  handleMetadata(metadata: Metadata) {
    if (!metadata.subjects) metadata.subjects = [];
    if (!metadata.author) metadata.author = 'Unknown';
    if (!metadata.description) metadata.description = '';
    if (!metadata.identifiers) metadata.identifiers = []; // create identifier ?
    if (!metadata.rights) metadata.rights = '';

    return metadata;
  }

  private async handleTableOfContents(
    file_id: string,
    epub: any,
    entries: string[],
  ) {
    const entry = entries.find((entry) => entry.endsWith(file_id));
    const fileBuffer = await epub.entryData(entry);
    const fileAsString = fileBuffer.toString();
  }
}
