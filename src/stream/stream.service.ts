import { BadRequestException, Injectable } from '@nestjs/common';
import { OpfService } from '../modules/opf/services/opf.service';
import { SectionService } from '../modules/epub/services/section.service';
import { ISection } from '../types/section.interface';
import { SectionDto } from '../dto/section.dto';
import { EpubService } from '../modules/epub/epub.service';
import { processXml } from '../helpers/xml-processor';

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

    const { metadata, manifest, spine, tocHrefs } = await this.epub.process(
      epub,
    );

    const tableOfContents = this.epub.createTableOfContents(epub, tocHrefs);
    const orderedManifest = this.epub.orderManifestItems(manifest.text, spine);

    const sections: Array<Partial<ISection>> = [];

    for await (const item of orderedManifest) {
      item.href = entries.find((entry) => entry.endsWith(item.href)); // TODO - necessary?
      this.epub
        .createSection(epub, item)
        .then((section) => sections.push(section)); // TODO - missing titles from TOC
    }

    metadata.content_count = this.getContentCount(sections);

    return {
      metadata,
      ordered_manifest: orderedManifest,
      spine,
      volume: sections,
      table_of_contents: tableOfContents,
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
    const xml = processXml(fileAsString, { preserveOrder: true });

    return this.sectionService.processSectionFile(xml);
  }

  private getContentCount(sections: Array<Partial<ISection>>) {
    let contentCount = 0;
    sections.forEach((section) => (contentCount += section.data.length));
    return contentCount;
  }
}
