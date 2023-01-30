import { Module } from '@nestjs/common';
import { TocNcxService } from './services/tocNcx.service';

@Module({
  imports: [],
  providers: [TocNcxService],
  exports: [TocNcxService],
})
export class TocModule {}
