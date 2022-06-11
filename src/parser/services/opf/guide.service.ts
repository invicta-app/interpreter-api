import { Injectable } from '@nestjs/common';
import { OpfGuide } from '../../../../types/opf/opf.type';

@Injectable()
export class GuideService {
  async processGuide(guide: OpfGuide) {
    return;
  }
}
