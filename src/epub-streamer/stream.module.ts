import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { OpfModule } from '../opf/opf.module';
import { SectionService } from '../services/section.service';

@Module({
  imports: [OpfModule],
  controllers: [StreamController],
  providers: [StreamService, SectionService],
})
export class StreamModule {}
