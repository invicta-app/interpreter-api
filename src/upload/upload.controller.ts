import { Controller, Put, Post, Param, Query } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/:volume_id')
  downloadVolume(
    @Param('volume_id') id: string,
    @Query('revise_title') revise_title: string,
  ) {
    const opts = { revise_title };
    return this.uploadService.uploadVolume(id, opts);
  }
}
