import { Injectable } from '@nestjs/common';
import { TextService } from './text.service';
import { ManifestService } from './opf/manifest.service';
import { MetadataService } from './opf/metadata.service';
import { SpineService } from './opf/spine.service';
import { GuideService } from './opf/guide.service';

@Injectable()
export class OpfService {
  constructor(
    private textServiceInjectable: TextService,
    private manifestServiceInjectable: ManifestService,
    private metadataServiceInjectable: MetadataService,
    private spineServiceInjectable: SpineService,
    private guideServiceInjectable: GuideService,
  ) {}
  textService = this.textServiceInjectable;
  metadataService = this.metadataServiceInjectable;
  manifestService = this.manifestServiceInjectable;
  spineService = this.spineServiceInjectable;
  guideService = this.guideServiceInjectable;
}
