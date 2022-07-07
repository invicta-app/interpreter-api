import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserController } from './parser.controller';
import { OpfService } from '../opf/services/opf.service';
import { SectionService } from '../services/section.service';
import { OpfModule } from '../opf/opf.module';

@Module({
  imports: [],
  controllers: [ParserController],
  providers: [ParserService, SectionService],
})
export class ParserModule {}
