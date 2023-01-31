import { Module } from '@nestjs/common';
import { TocNcxService } from './services/tocNcx.service';
import { TocSectionService } from './services/tocSection.service';

@Module({
  imports: [],
  providers: [TocNcxService, TocSectionService],
  exports: [TocNcxService, TocSectionService],
})
export class TocModule {}
