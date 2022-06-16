import { Injectable } from '@nestjs/common';
import { getText } from '../../helpers/text.helpers';
import { splitHtmlHref } from '../../helpers/splitHtmlHref';

@Injectable()
export class TocService {
  private mapTocSection(section: any) {
    const title = getText(section?.a);
    if (!title) return;
    const { href_path, href_id } = splitHtmlHref(section?.a?.href);
    const parent_css_class = section?.class;
    const child_css_class = section?.a?.class;
    return {
      title,
      href: href_path,
      href_id,
      parent_css_class,
      child_css_class,
    };
  }
}
