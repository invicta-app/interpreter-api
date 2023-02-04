import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Manifest, ManifestItem } from '../../types/manifest.types';
import { getRootPath } from '../../helpers/rootPath';
import * as StreamZip from 'node-stream-zip';
import { processXml } from '../../helpers/xml-processor';
import { Spine } from '../../types/spine.type';
import { getOpfFilePath } from '../../helpers/getOpfFilePath';
import { OpfObject } from '../../types/opf.type';
import { Metadata } from '../../types/metadata.types';
import { OpfService } from '../opf/services/opf.service';
import { TableOfContents, TocHref } from '../../types/tableOfContents.types';
import { TocNcxService } from '../toc/services/tocNcx.service';
import { splitFileHref } from '../../helpers/splitFileHref';
import { SectionService } from './services/section.service';
import { TocSectionService } from '../toc/services/tocSection.service';
import { ISection } from '../../types/section.interface';

@Injectable()
export class EpubService {
  constructor(
    private opf: OpfService,
    private tocNcxService: TocNcxService,
    private tocSectionService: TocSectionService,
    private sectionService: SectionService,
  ) {}

  async stream(book_id: string) {
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

  async process(epub) {
    const containerBuffer = await epub.entryData('META-INF/container.xml');
    const containerXml: string = containerBuffer.toString();
    const opfPath: any = await getOpfFilePath(containerXml);
    const opfBuffer = await epub.entryData(opfPath);
    const opfXml = opfBuffer.toString();

    const opfObject: OpfObject = await processXml(opfXml);

    const metadata: Metadata = this.opf.metadataService.processMetadata(
      opfObject.package.metadata,
    );
    const manifest: Manifest = this.opf.manifestService.processManifest(
      opfObject.package.manifest,
    );
    const spine: Spine = this.opf.spineService.processSpine(
      opfObject.package.spine,
    );
    const tocHrefs: Array<TocHref> = this.opf.tocService.getTocHrefs(opfObject);

    return { metadata, manifest, spine, tocHrefs };
  }

  async createSection(epub: any, item: ManifestItem) {
    const fileBuffer = await epub.entryData(item.href);
    const fileAsString = fileBuffer.toString();
    const xml = await processXml(fileAsString, { preserveOrder: true });

    const section = this.sectionService.processSectionFile(xml);
    section.ref_id = item.id;
    section.section = item.order;
    section.href = item.href;

    return section as ISection;
  }

  async createTableOfContents(epub: any, tocHrefs: Array<TocHref>) {
    const { href, type } = this.handleHref(tocHrefs);
    const fileBuffer = await epub.entryData(href);
    const fileAsString = fileBuffer.toString();
    const tocXml = await processXml(fileAsString, { preserveOrder: true });

    let toc = [];
    if (type === 'section') toc = this.tocSectionService.processTocFile(tocXml);
    // if (type === 'ncx') toc = this.tocNcxService.processTocNcx(tocXml);

    const entries = Object.keys(await epub.entries());
    toc = this.updateTocEntries(toc, entries);

    return toc;
  }

  formatEntries(entries: any) {
    const entriesArr: Array<string> = [];
    for (const [key] of Object.entries(entries)) entriesArr.push(key);
    return entriesArr;
  }

  orderManifestItems(
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

  appendTitleToSections(
    partialSections: Array<Partial<ISection>>,
    toc: TableOfContents,
  ) {
    // TODO - not showing directory in Table of Contents
    const sections: Array<ISection> = [];

    for (const section of partialSections) {
      const segment = toc.find((segment) => segment.href === section.href);

      if (segment) {
        section.title = segment.title;
        sections.push(section as ISection);
      } else {
        section.title = '';
        sections.push(section as ISection);
      }
    }

    return sections;
  }

  // PRIVATE INTERFACE

  private handleHref(tocHrefs: Array<TocHref>) {
    // TODO - TOC Decision Tree
    const item = tocHrefs.find((item) => item.type === 'section');

    if (!item)
      throw new InternalServerErrorException(
        'EPUB does not contain a valid type declaration',
        tocHrefs.toString(),
      );

    if (item.href.includes('#')) {
      const { href_path } = splitFileHref(item.href);
      return { href: href_path, type: item.type };
    }

    return item;
  }

  private updateTocEntries(
    toc: TableOfContents,
    entries: Array<string>,
  ): TableOfContents {
    for (let i = 0; i < toc.length; i++) {
      toc[i].href = entries.find((e) => e.endsWith(toc[i].href));
    }

    return toc;
  }
}
