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

@Injectable()
export class EpubService {
  constructor(private opf: OpfService, private tocNcxService: TocNcxService) {}

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
    console.log('TOC HREFS:', tocHrefs);
    const ncxHref = tocHrefs.find((item) => item.href.includes('toc.ncx')).href;

    if (!ncxHref)
      throw new InternalServerErrorException(
        'EPUB does not contain toc.ncx declaration',
      );

    const tocBuffer = epub.entryData(ncxHref);
    const tocXml = tocBuffer.toString();
    const tocObject = await processXml(tocXml, { preserveOrder: true });

    console.log('TOC OBJECT:', tocObject);

    return this.tocNcxService.processTocNcx(tocObject);
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
}
