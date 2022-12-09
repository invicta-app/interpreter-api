import { Controller, Put, Post, Param } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('download')
export class UploadController {
  constructor(private readonly downloadService: UploadService) {}

  @Post('/:volume_id')
  downloadVolume(
    @Param('volume_id') id: string,
    @Param('revised_title') revised_title: string,
  ) {
    const opts = { revised_title: revised_title };
    return this.downloadService.downloadVolume(id, opts);
  }

  @Put('/:volume_id')
  updateVolume(@Param('volume_id') id: string) {
    return this.downloadService.overwriteVolume(id);
  }

  @Put('/:volume_id/section/:section')
  updateVolumeSection(
    @Param('volume_id') volume_id: string,
    @Param('section') section: number,
  ) {
    return this.downloadService.updateSection({
      volume_id: volume_id,
      section_number: section,
    });
  }

  @Put('/:volume_id/metadata')
  updateVolumeMetadata() {}
}
