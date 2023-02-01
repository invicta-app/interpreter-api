import { Module } from '@nestjs/common';
import { TocNcxService } from './services/tocNcx.service';
import { TocSectionService } from './services/tocSection.service';
import { ParserModule } from '../parser/parser.module';

@Module({
  imports: [ParserModule],
  providers: [TocNcxService, TocSectionService],
  exports: [TocNcxService, TocSectionService],
})
export class TocModule {}
