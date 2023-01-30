import { Injectable } from '@nestjs/common';
import { OpfSpine } from '../../../types/opf.type';

@Injectable()
export class SpineService {
  processSpine(spine: OpfSpine) {
    return spine.itemref;
  }
}
