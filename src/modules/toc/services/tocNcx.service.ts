import { Injectable } from '@nestjs/common';

@Injectable()
export class TocNcxService {
  async processTocNcx(tocObj: any) {
    console.log('TABLE OF CONTENTS:', JSON.stringify(tocObj, null, 2));

    return '';
  }

  private drillXml(node: any) {
    return '';
  }
}

const item = {
  ref: '#filepos_123232',
  title: 'Chapter 3: Fuck Off!',
};
