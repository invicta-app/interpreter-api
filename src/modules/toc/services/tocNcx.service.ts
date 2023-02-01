import { Injectable } from '@nestjs/common';
import { TableOfContents } from '../../../types/tableOfContents.types';

@Injectable()
export class TocNcxService {
  async processTocNcx(tocObj: any) {
    console.log('TABLE OF CONTENTS:', JSON.stringify(tocObj, null, 2));
    this.drillXml(tocObj[0]);
  }

  private drillXml(node: any) {
    return node;
  }
}
