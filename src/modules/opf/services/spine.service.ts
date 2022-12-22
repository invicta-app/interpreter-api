import { Injectable } from '@nestjs/common';
import { OpfSpine } from '../../../types/opf/opf.type';

@Injectable()
export class SpineService {
  processSpine(spine: OpfSpine) {
    return spine.itemref;
  }
}
