import { Injectable } from '@nestjs/common';

@Injectable()
export class NcxService {
  async processTocNcx(tocNcx: any) {
    // console.log('TABLE OF CONTENTS:', JSON.stringify(tocNcx, null, 2));

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
