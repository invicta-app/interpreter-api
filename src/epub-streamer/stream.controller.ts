import { Controller, Get, Param } from '@nestjs/common';
import { StreamService } from './stream.service';
import { SectionDto } from './dto/section.dto';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get('/volume/:id')
  volume(@Param('id') id: string) {
    return this.streamService.streamVolume(id);
  }

  @Get('/volume/:id/section/:section')
  section(
    @Param('id') volume_id: string,
    @Param('section') section_number: number,
  ) {
    const sectionDto: SectionDto = { volume_id, section_number };
    return this.streamService.streamVolumeSection(sectionDto);
  }
}
