import { Module } from '@nestjs/common';
import { OpfModule } from '../opf/opf.module';
import { EpubService } from './epub.service';
import { TocModule } from '../toc/toc.module';

@Module({
  imports: [OpfModule, TocModule],
  providers: [EpubService],
  exports: [EpubService],
})
export class EpubModule {}
