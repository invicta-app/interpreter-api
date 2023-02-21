import { BadRequestException, Injectable } from '@nestjs/common';
import { SectionService } from '../modules/epub/services/section.service';
import { ISection } from '../types/section.interface';
import { SectionDto } from '../dto/section.dto';
import { EpubService } from '../modules/epub/epub.service';
import { processXml } from '../helpers/xml-processor';

@Injectable()
export class StreamService {
  constructor(
    private epub: EpubService,
    private sectionService: SectionService,
  ) {}

  async streamVolume(volume_id: string) {
    const epub = await this.epub.stream(volume_id);
    const entries = this.epub.formatEntries(await epub.entries());
    const { metadata, manifest, tocHrefs } = await this.epub.process(epub);
    const tableOfContents = await this.epub.createTableOfContents(
      epub,
      tocHrefs,
    );

    // Post Processing
    const partialSections: Array<Partial<ISection>> = [];

    for await (const item of manifest) {
      item.href = entries.find((entry) => entry.endsWith(item.href)); // TODO - necessary?
      const section = await this.epub.createSection(epub, item);
      if (section) partialSections.push(section);
    }

    metadata.content_count = this.getContentCount(partialSections);
    metadata.section_count = partialSections.length;

    const sections = this.epub.appendTitleToSections(
      partialSections,
      tableOfContents,
    );

    return {
      metadata,
      volume: sections,
      table_of_contents: tableOfContents,
    };
  }

  async streamVolumeSection(sectionDto: SectionDto) {
    const { volume_id, section_number } = sectionDto;
    const epub = await this.epub.stream(volume_id);
    const entries = this.epub.formatEntries(await epub.entries());
    const { manifest } = await this.epub.process(epub);

    const section = manifest.find((item) => item.order == section_number);

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
    sections.forEach((section) => (contentCount += section.content.length));
    return contentCount;
  }
}
