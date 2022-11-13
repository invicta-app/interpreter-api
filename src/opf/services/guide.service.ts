import { BadRequestException, Injectable } from '@nestjs/common';
import { OpfGuide } from '../../types/opf/opf.type';

@Injectable()
export class GuideService {
  // DEPRECATED with EPUB 3.0
  async processGuide(guide: OpfGuide) {
    const tocRef = guide.reference.find((item) => item.type === 'toc');
    return;
  }

  async getTocHref(guide: OpfGuide) {
    if (!guide) return;
    if (Array.isArray(guide.reference)) {
      const tocRef = guide.reference.find((item) => item.type === 'toc');
      return tocRef;
    }
  }
}
