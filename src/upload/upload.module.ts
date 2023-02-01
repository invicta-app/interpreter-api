import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { EpubModule } from '../modules/epub/epub.module';
import { OpfModule } from '../modules/opf/opf.module';
import { SectionService } from '../modules/epub/services/section.service';

@Module({
  imports: [EpubModule, OpfModule],
  controllers: [UploadController],
  providers: [UploadService, SectionService],
})
export class UploadModule {}
