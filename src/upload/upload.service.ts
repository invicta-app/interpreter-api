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

@Injectable()
export class UploadService {
  constructor(
    private epub: EpubService,
    private sectionService: SectionService,
  ) {}

  async uploadVolume(volume_id: string, opts?: { revise_title?: string }) {
    const epub = await this.epub.stream(volume_id);
    const entries = this.epub.formatEntries(await epub.entries());

    const { metadata, manifest, spine } = await this.epub.process(epub);

    if (opts.revise_title) metadata.title = opts.revise_title;

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

    const body = { metadata, volume };

    const url = process.env.INVICTA_API + '/volumes/api/v1/books';

    try {
      const res = await axios.post(url, body);
      console.log('SUCCESS ✅');
      return res.data;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
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
}
