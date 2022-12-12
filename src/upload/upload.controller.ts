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

  @Put('/:volume_id')
  updateVolume(@Param('volume_id') id: string) {
    return this.uploadService.overwriteVolume(id);
  }

  @Put('/:volume_id/section/:section')
  updateVolumeSection(
    @Param('volume_id') volume_id: string,
    @Param('section') section: number,
  ) {
    return this.uploadService.updateSection({
      volume_id: volume_id,
      section_number: section,
    });
  }

  @Put('/:volume_id/metadata')
  updateVolumeMetadata() {}
}
