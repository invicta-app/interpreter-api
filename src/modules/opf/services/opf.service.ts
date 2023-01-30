import { Injectable } from '@nestjs/common';
import { ManifestService } from './manifest.service';
import { MetadataService } from './metadata.service';
import { SpineService } from './spine.service';
import { TocHrefService } from './tocHref.service';

@Injectable()
export class OpfService {
  constructor(
    private manifestServiceInjectable: ManifestService,
    private metadataServiceInjectable: MetadataService,
    private spineServiceInjectable: SpineService,
    private tocServiceInjectable: TocHrefService,
  ) {}

  metadataService = this.metadataServiceInjectable;
  manifestService = this.manifestServiceInjectable;
  spineService = this.spineServiceInjectable;
  tocService = this.tocServiceInjectable;
}
