import { Module } from '@nestjs/common';
import { OpfService } from './services/opf.service';
import { ManifestService } from './services/manifest.service';
import { MetadataService } from './services/metadata.service';
import { SpineService } from './services/spine.service';
import { TocHrefService } from './services/tocHref.service';

@Module({
  imports: [],
  providers: [
    OpfService,
    ManifestService,
    MetadataService,
    SpineService,
    TocHrefService,
    TocHrefService,
  ],
  exports: [
    OpfService,
    ManifestService,
    MetadataService,
    SpineService,
    TocHrefService,
    TocHrefService,
  ],
})
export class OpfModule {}
