import { Injectable } from '@nestjs/common';
import { OpfGuide, OpfManifest, OpfObject } from '../../../types/opf.type';
import { TocHref } from '../../../types/tableOfContents.types';

@Injectable()
export class TocHrefService {
  getTocHrefs(opfObject: OpfObject): Array<TocHref> {
    const hrefs: Array<TocHref> = [];

    if (opfObject.package.guide) {
      const href = this.getGuideTocHref(opfObject.package.guide);
      hrefs.push(href);
    }
    if (opfObject.package.manifest) {
      const href = this.getManifestTocHref(opfObject.package.manifest);
      hrefs.push(href);
    }

    return hrefs.filter(Boolean) as Array<TocHref>;
  }

  private getManifestTocHref(manifest: OpfManifest) {
    const item = manifest.item.find((item) => item.href.includes('toc.ncx'));
    return { type: 'ncx', href: item.href } as TocHref;
  }

  private getGuideTocHref(guide: OpfGuide) {
    if (Array.isArray(guide.reference)) {
      const tocHref = guide.reference.find((item) => item.type === 'toc');
      if (tocHref) return { type: 'section', href: tocHref.href } as TocHref;
      else return;
    }
    // TODO - guide TOC type = 'text'
  }
}
