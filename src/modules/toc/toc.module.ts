import { Module } from '@nestjs/common';
import { TocNcxService } from './services/tocNcx.service';
import { TocSectionService } from './services/tocSection.service';
import { ParserModule } from '../parser/parser.module';
import { ParserService } from '../parser/parser.service';

@Module({
  imports: [ParserModule],
  providers: [TocNcxService, TocSectionService, ParserService],
  exports: [TocNcxService, TocSectionService],
})
export class TocModule {}
