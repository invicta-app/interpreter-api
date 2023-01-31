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
import { TocHref } from '../../types/tableOfContents.types';
import { TocNcxService } from '../toc/services/tocNcx.service';
import { splitFileHref } from '../../helpers/splitFileHref';
import { SectionService } from '../../services/section.service';
import { TocSectionService } from '../toc/services/tocSection.service';

@Injectable()
export class EpubService {
  constructor(
    private opf: OpfService,
    private tocNcxService: TocNcxService,
    private tocSectionService: TocSectionService,
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

  async createTableOfContents(epub: any, tocHrefs: Array<TocHref>) {
    const { href, type } = this.handleHref(tocHrefs);
    const tocBuffer = await epub.entryData(href);
    const tocXml = tocBuffer.toString();
    const tocObject = await processXml(tocXml, { preserveOrder: true });

    if (type === 'ncx') return this.tocNcxService.processTocNcx(tocObject);
    if (type === 'section')
      return this.tocSectionService.processTocFile(tocObject);
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

    // TODO - read epub entry data and sync

    return item;
  }
}
