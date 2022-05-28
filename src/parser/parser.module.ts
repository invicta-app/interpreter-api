import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserController } from './parser.controller';
import { ContentOpfService } from './services/content.opf.service';
import { TocService } from './services/toc.service';
import { TextService } from './services/text.service';

@Module({
  controllers: [ParserController],
  providers: [ParserService, ContentOpfService, TocService, TextService],
})
export class ParserModule {}
