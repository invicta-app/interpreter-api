import { Injectable } from '@nestjs/common';
import { ManifestService } from './manifest.service';
import { MetadataService } from './metadata.service';
import { SpineService } from './spine.service';
import { GuideService } from './guide.service';

@Injectable()
export class OpfService {
  constructor(
    private manifestServiceInjectable: ManifestService,
    private metadataServiceInjectable: MetadataService,
    private spineServiceInjectable: SpineService,
    private guideServiceInjectable: GuideService,
  ) {}
  metadataService = this.metadataServiceInjectable;
  manifestService = this.manifestServiceInjectable;
  spineService = this.spineServiceInjectable;
  guideService = this.guideServiceInjectable;
}
