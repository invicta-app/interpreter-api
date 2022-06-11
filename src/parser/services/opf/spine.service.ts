import { Injectable } from '@nestjs/common';
import { OpfSpine } from '../../../../types/opf/opf.type';

@Injectable()
export class SpineService {
  async processSpine(spine: OpfSpine) {
    return;
  }
}
