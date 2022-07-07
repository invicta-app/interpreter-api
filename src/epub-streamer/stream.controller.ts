import { Controller, Post, Body } from '@nestjs/common';
import { StreamDto } from './dto/stream.dto';
import { StreamService } from './stream.service';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  downloadEpub(@Body() streamDto: StreamDto) {
    return this.streamService.streamEpub(streamDto);
  }
}
