import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserController } from './parser.controller';
import { OpfService } from './services/opf.service';
import { MetadataService } from './services/opf/metadata.service';
import { NcxService } from './services/ncx.service';
import { TextService } from './services/text.service';
import { ManifestService } from './services/opf/manifest.service';

@Module({
  controllers: [ParserController],
  providers: [
    ParserService,
    OpfService,
    MetadataService,
    ManifestService,
    NcxService,
    TextService,
  ],
})
export class ParserModule {}
