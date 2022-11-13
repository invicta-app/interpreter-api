import { Injectable } from '@nestjs/common';
import { ManifestItem } from '../types/manifest.types';
import { ISection } from '../types/section.interface';
import { processXml } from '../xml/xml-processor';
import { isArray } from '../helpers/validatePrimitives';

@Injectable()
export class SectionService {
  async createSection(item: ManifestItem, fileAsString: string) {
    const xml = await processXml(fileAsString, { preserveOrder: true });

    console.log(JSON.stringify(xml, null, 2)); // IT WORKS !!!

    const markdown = await this.convertToMarkdown(xml);

    console.log('markdown: :', markdown);

    const section: ISection = {
      id: item.id,
      text: markdown,
      body_id: xml?.html?.body?.id,
      body_class: xml?.html?.body?.class,
      position: item.order,
    };

    return section as ISection;
  }

  private async convertToMarkdown(xml: any) {
    const markdown = this.drillXML(xml as any);
    // validate markdown
    return markdown;
  }

  private drillXML(node: any) {
    if (isArray(node)) return node.map((n) => this.drillXML(n)).flat();
    if (node?.text) return node.text;

    // Higher Level XML Components
    if (node?.html) return this.drillXML(node.html);
    if (node?.body) return this.drillXML(node.body);
    if (node?.section) return this.drillXML(node.section);

    // Text
    if (node?.title) return `X${node.title}X`;
    if (node?.span) return `${this.drillXML(node.span)} `;
    if (node?.p) return `${this.drillXML(node.p)}`;
    if (node?.i) return `__${this.drillXML(node.i)}__`;
    if (node?.q) return `*${this.drillXML(node.q)}*`;
    if (node?.blockquote) return `*${this.drillXML(node.blockquote)}*`;

    // Headers
    if (node?.h1) return `${this.drillXML(node.h1)}`;
    if (node?.h2) return `${this.drillXML(node.h2)}`;
    if (node?.h3) return `${this.drillXML(node.h3)}`;
    if (node?.h4) return `${this.drillXML(node.h4)}`;
    if (node?.h5) return `${this.drillXML(node.h5)}`;
    if (node?.h6) return `${this.drillXML(node.h6)}`;

    return '';
  }
}
