import { Injectable } from '@nestjs/common';
import { ParserDto } from './dto/parser.dto';
import { OpfService } from './services/opf.service';
import { NcxService } from './services/ncx.service';
import { StreamZipAsync } from 'node-stream-zip';
import * as StreamZip from 'node-stream-zip';
import { TextService } from './services/text.service';
import { ContentPartial } from '../../types/content.type';
import { getRootPath } from '../helpers/rootPath';
import { Metadata } from './types/metadata.type';
import { Opf, OpfManifest } from '../../types/opf/opf.type';
import { parseXml } from './xml/xml-parser';
import { MetadataService } from './services/opf/metadata.service';
import { ManifestService } from './services/opf/manifest.service';

@Injectable()
export class ParserService {
  constructor(
    private opfService: OpfService,
    private metadataService: MetadataService,
    private manifestService: ManifestService,
    private tocService: NcxService,
    private textService: TextService,
  ) {}

  async create(parserDto: ParserDto) {
    const { ref_id, section } = parserDto;
    const rootPath = getRootPath(ref_id);
    const opfPath: string = await this.opfService.getOpfPath(rootPath);
    const opf: Opf = await parseXml(opfPath);

    const metadata: Metadata = await this.metadataService.processMetadata(
      opf.package.metadata,
    );
    const manifest: any = await this.manifestService.processManifest(
      opf.package.manifest,
    );

    const data = { rootPath, metadata };

    return data;
  }

  private async saveDocument() {
    return;
  }

  private async unzipEpub(path: string, ref_id: string) {
    const zip: StreamZipAsync = new StreamZip.async({
      file: path,
      storeEntries: true,
    });
    try {
      await zip.extract(null, path);
    } catch (error) {
      console.log('ERROR:', error);
    }
  }
}
