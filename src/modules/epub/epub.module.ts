import { Module } from '@nestjs/common';
import { OpfModule } from '../opf/opf.module';
import { EpubService } from './epub.service';

@Module({
  imports: [OpfModule],
  providers: [EpubService],
  exports: [EpubService],
})
export class EpubModule {}
