import { Module } from '@nestjs/common';
import { NcxService } from './services/ncx.service';

@Module({
  imports: [],
  providers: [NcxService],
  exports: [NcxService],
})
export class TocModule {}
