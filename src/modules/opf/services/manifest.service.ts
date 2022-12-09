import { Injectable } from '@nestjs/common';
import { OpfManifest, OpfManifestItem } from '../../../types/opf/opf.type';
import { ManifestTypes, Manifest } from '../../../types/manifest.types';

@Injectable()
export class ManifestService {
  processManifest(opfManifest: OpfManifest): Manifest {
    const rawItems: Array<OpfManifestItem> = opfManifest.item;

    const manifest: Manifest = {
      text: [],
      image: [],
      font: [],
      css: [],
    };

    for (const item of rawItems) {
      switch (item['media-type']) {
        case ManifestTypes.TEXT:
          manifest.text.push(this.formatManifestItem(item));
          break;
        case ManifestTypes.CSS:
          manifest.css.push(this.formatManifestItem(item));
          break;
        case ManifestTypes.IMAGE:
          manifest.image.push(this.formatManifestItem(item));
          break;
        case ManifestTypes.FONT:
          manifest.font.push(this.formatManifestItem(item));
          break;
        default:
          break;
      }
    }
    return manifest as Manifest;
  }

  private formatManifestItem(item: OpfManifestItem) {
    return {
      href: item.href,
      id: item.id,
      media_type: item['media-type'],
    };
  }
}
