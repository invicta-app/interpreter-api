import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Manifest, ManifestItem } from '../../types/manifest.types';
import { getRootPath } from '../../helpers/rootPath';
import StreamZip from 'node-stream-zip';
import { processXml } from '../../helpers/xml-processor';
import { Guide } from '../../types/guide.types';
import { Spine } from '../../types/spine.type';
import { getOpfFilePath } from '../../helpers/getOpfFilePath';
import { OpfObject } from '../../types/opf/opf.type';
import { Metadata } from '../../types/metadata.types';
import { OpfService } from '../opf/services/opf.service';

@Injectable()
export class EpubService {
  constructor(private opf: OpfService) {}

  async stream(book_id: string) {
    const path = getRootPath(book_id);

    console.log('path:', path);
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

    // TODO
    // Introduce toc.xhtml for more detailed table of contents
    // Spine seems to be contain limited information

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
