import { BadRequestException, Injectable } from '@nestjs/common';
import { OpfGuide } from '../../../types/opf/opf.type';

@Injectable()
export class GuideService {
  // DEPRECATED with EPUB 3.0
  async processGuide(guide: OpfGuide) {
    const tocRef = guide.reference.find((item) => item.type === 'toc');
    return;
  }

  getTocNcxRef(guide: OpfGuide): string {
    if (!guide) return;
    if (guide.reference) {
      const tocRef = guide.reference.find((item) => item.type === 'toc');
      if (tocRef) return tocRef.href;
      else return null;
    }
  }
}
