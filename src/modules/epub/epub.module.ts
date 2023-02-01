import { Module } from '@nestjs/common';
import { OpfModule } from '../opf/opf.module';
import { EpubService } from './epub.service';
import { TocModule } from '../toc/toc.module';
import { SectionService } from './services/section.service';
import { ParserService } from '../parser/parser.service';

@Module({
  imports: [OpfModule, TocModule],
  providers: [EpubService, ParserService, SectionService],
  exports: [EpubService],
})
export class EpubModule {}
