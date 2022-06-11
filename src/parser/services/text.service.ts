import { Injectable } from '@nestjs/common';
import { ContentPartial } from '../../../types/content.type';
import { getRootPath } from '../../helpers/rootPath';

@Injectable()
export class TextService {
  constructor() {}

  async assignText(content: ContentPartial) {
    const { href, href_id } = content;
    const path = getRootPath();
    const chapter_path = `${path}/text/${href}`;
    return;
  }
}
