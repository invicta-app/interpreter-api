import { Injectable } from '@nestjs/common';
import { getRootPath } from '../../helpers/rootPath';
import { ManifestItem } from '../../../types/manifest.type';
import * as fs from 'fs-extra';

@Injectable()
export class TextService {
  async assignText(ref_id: string, item: ManifestItem) {
    const path = getRootPath(ref_id);
    const { href, id } = item;
    const sectionPath = `${path}/${href}`;

    const file = await fs.readFile(sectionPath);
    const html = file.toString();

    console.log('FILE:', html);

    return;
  }

  private findKey(arr: Array<any>, key: string) {
    const found = arr.find((item) => item[key]);
    return found;
  }

  private isArray = (name, jpath, isLeafNode, isAttribute) => {
    return false;
    if (isLeafNode) return false;
    if (isAttribute) return false;
    if ([].indexOf(jpath) !== -1) return true; // basically - NO
  };
}
