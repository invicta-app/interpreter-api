import { BadRequestException, Injectable } from '@nestjs/common';
import { OpfGuide } from '../../types/opf/opf.type';

@Injectable()
export class GuideService {
  async processGuide(guide: OpfGuide) {
    const tocRef = guide.reference.find((item) => item.type === 'toc');
    return;
  }

  async getTocHref(guide: OpfGuide) {
    const tocRef = guide.reference.find((item) => item.type === 'toc');
    return tocRef;
  }
}
