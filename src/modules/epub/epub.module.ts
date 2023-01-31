import { Module } from '@nestjs/common';
import { OpfModule } from '../opf/opf.module';
import { EpubService } from './epub.service';
import { TocModule } from '../toc/toc.module';
import { SectionService } from '../../services/section.service';
import { ParserService } from './services/parser.service';

@Module({
  imports: [OpfModule, TocModule],
  providers: [EpubService, ParserService],
  exports: [EpubService],
})
export class EpubModule {}
