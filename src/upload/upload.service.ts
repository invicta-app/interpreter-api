import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ISection } from '../types/section.interface';
import { EpubService } from '../modules/epub/epub.service';
import axios from 'axios';
import { Metadata } from '../types/metadata.types';

@Injectable()
export class UploadService {
  constructor(private epub: EpubService) {}

  async uploadVolume(volume_id: string, opts?: { revise_title?: string }) {
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

    if (opts.revise_title) metadata.title = opts.revise_title;
    metadata.content_count = this.getContentCount(sections);

    const body = {
      volume: sections,
      metadata: this.handleMetadata(metadata),
      table_of_contents: tableOfContents,
    };

    try {
      const url = process.env.INVICTA_API + '/api/v1/books';
      const res = await axios.post(url, body);
      return res.data;
    } catch (err) {
      throw new InternalServerErrorException(
        'Invicta API request failed',
        err.message,
      );
    }
  }

  // Private Interface

  private handleMetadata(metadata: Metadata) {
    if (!metadata.subjects) metadata.subjects = [];
    if (!metadata.author) metadata.author = 'Unknown';
    if (!metadata.description) metadata.description = '';
    if (!metadata.identifiers) metadata.identifiers = []; // create identifier ?
    if (!metadata.rights) metadata.rights = '';

    return metadata;
  }

  private getContentCount(sections: Array<Partial<ISection>>) {
    let contentCount = 0;
    sections.forEach((section) => (contentCount += section.data.length));
    return contentCount;
  }
}
