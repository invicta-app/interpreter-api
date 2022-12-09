import { Module } from '@nestjs/common';
import { OpfService } from './services/opf.service';
import { ManifestService } from './services/manifest.service';
import { MetadataService } from './services/metadata.service';
import { SpineService } from './services/spine.service';
import { GuideService } from './services/guide.service';

@Module({
  imports: [],
  providers: [
    OpfService,
    ManifestService,
    MetadataService,
    SpineService,
    GuideService,
  ],
  exports: [
    OpfService,
    ManifestService,
    MetadataService,
    SpineService,
    GuideService,
  ],
})
export class OpfModule {}
