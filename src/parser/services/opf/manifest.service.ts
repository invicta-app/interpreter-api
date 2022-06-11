import { Injectable } from '@nestjs/common';
import { OpfManifest, OpfManifestItem } from '../../../../types/opf/opf.type';
import { DelegatedManifest, ManifestFormats } from '../opf.service';

@Injectable()
export class ManifestService {
  async processManifest(manifest: OpfManifest) {
    const rawItems: Array<OpfManifestItem> = manifest.item;
    const manifestItems = this.delegateManifestItems(rawItems);
    const orderedItems = this.orderManifestItems(manifestItems);

    return manifestItems;
  }

  private delegateManifestItems(
    manifestItems: Array<OpfManifestItem>,
  ): DelegatedManifest {
    const delegated: DelegatedManifest = {
      text: [],
      image: [],
      font: [],
      css: [],
    };

    for (const item of manifestItems) {
      switch (item['media-type']) {
        case ManifestFormats.TEXT:
          delegated.text.push(this.formatManifestItem(item));
          break;
        case ManifestFormats.CSS:
          delegated.css.push(this.formatManifestItem(item));
          break;
        case ManifestFormats.IMAGE:
          delegated.image.push(this.formatManifestItem(item));
          break;
        case ManifestFormats.FONT:
          delegated.font.push(this.formatManifestItem(item));
          break;
        default:
          break;
      }
    }
    return delegated;
  }

  private formatManifestItem(item: OpfManifestItem) {
    return {
      href: item.href,
      id: item.id,
      media_type: item['media-type'],
    };
  }

  private orderManifestItems(item: Array<any>) {
    return;
  }
}
