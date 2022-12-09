import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { SectionService } from '../services/section.service';
import { EpubModule } from '../modules/epub/epub.module';
import { OpfModule } from '../modules/opf/opf.module';

@Module({
  imports: [EpubModule, OpfModule],
  controllers: [StreamController],
  providers: [StreamService, SectionService],
})
export class StreamModule {}
