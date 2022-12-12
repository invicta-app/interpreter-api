import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ManifestItem } from '../types/manifest.types';
import { ISection } from '../types/section.interface';
import { processXml } from '../helpers/xml-processor';
import { isArray } from '../helpers/validatePrimitives';
import { ContentBlock, TextModifier } from '../types/content.types';

@Injectable()
export class SectionService {
  async createSection(item: ManifestItem, fileAsString: string) {
    const xml = await processXml(fileAsString, { preserveOrder: true });

    const content = await this.drillXml(xml);

    const section: ISection = {
      id: item.id,
      data: content,
      body_id: xml?.html?.body?.id,
      body_class: xml?.html?.body?.class,
      length: content?.data?.length,
      section: item.order,
      metadata: {},
    };

    return section as ISection;
  }

  private drillXml(node: any) {
    if (isArray(node)) {
      let nodes = node.map((n) => this.drillXml(n));
      nodes = nodes.filter((n) => n);
      nodes = nodes.filter((n) => n.text !== '');
      nodes = nodes.flat();

      return this.formatNodes(nodes);
    }

    // Unique Elements
    if (node?.text) return this.processText(node.text);

    // Higher Level XML Components
    if (node?.html) return this.drillXml(node.html);
    if (node?.head) return this.drillXml(node.head);
    if (node?.body) return this.drillXml(node.body);
    if (node?.section) return this.drillXml(node.section);
    if (node?.div) return this.drillXml(node.div);

    // Content Blocks
    if (node?.p) return this.handleContentBlock(node.p, 'paragraph');
    if (node?.title) return this.handleContentBlock(node.title, 'title');
    if (node?.blockquote)
      return this.handleContentBlock(node.blockquote, 'blockquote');
    if (node?.h1) return this.handleContentBlock(node.h1, 'header_1');
    if (node?.h2) return this.handleContentBlock(node.h2, 'header_2');
    if (node?.h3) return this.handleContentBlock(node.h3, 'header_3');
    if (node?.h4) return this.handleContentBlock(node.h2, 'header_4');
    if (node?.h5) return this.handleContentBlock(node.h5, 'header_5');
    if (node?.h6) return this.handleContentBlock(node.h6, 'header_6');

    // Text Modifiers
    if (node?.span) return this.handleTextModifier(node.span, 'span');
    if (node?.i) return this.handleTextModifier(node.i, 'italicize');
    if (node?.q) return this.handleTextModifier(node.q, 'quote');
    if (node?.a) return this.handleTextModifier(node.a, 'link');
    if (node?.s) return this.handleTextModifier(node.s, 'strong');
    if (node?.strong) return this.handleTextModifier(node.strong, 'strong');
    if (node?.br) return this.handleTextModifier(node.br, 'break');
    if (node?.small) return this.handleTextModifier(node.small, 'small');
  }

  private handleContentBlock(node, contentType: ContentBlock) {
    const text = this.drillXml(node)?.join(' ');
    if (!text) return;

    return {
      text: text,
      content_type: contentType,
      length: text.length,
      metadata: {},
    };
  }

  private handleTextModifier(node, modifier?: TextModifier) {
    const nodes = this.drillXml(node);
    const text = this.joinNodes(nodes);

    const [before, after] = this.handleModifierSpacing(modifier);

    if (modifier === 'span') return `${before}${text}${after}`;
    if (modifier === 'italicize') return `${before}*${text}*${after}`;
    if (modifier === 'emphasize') return `${before}**${text}**${after}`;
    if (modifier === 'strong') return `${before}**${text}**${after}`;
    if (modifier === 'quote') return `${before}**${text}**${after}`;
    if (modifier === 'link') return `${before}${text}${after}`; // TODO
    if (modifier === 'break') return `\n`; // TODO
    if (modifier === 'small') return `${before}${text}${after}`;
    if (modifier === 'super') return `${before}${text}${after}`;

    throw new InternalServerErrorException(
      `Unidentified text modifier: ${modifier}`,
    );
  }

  private joinNodes(nodes: Array<any>) {
    return nodes.join(' ').toString();
  }

  private processText(text: string): string {
    let processedText = text;

    if (typeof text === 'number') processedText = processedText.toString();

    processedText = processedText.replace('&nbsp;', ' ');
    processedText = processedText.replace('&#160;', ' ');

    return processedText;
  }

  private formatNodes(nodes: Array<any>) {
    const isStringArray = nodes.every((node) => typeof node === 'string');

    if (isStringArray) return nodes;

    return nodes.map((node, index) => {
      node.sequence = index;
      node.text = node.text.replace(/\s\s+/g, ' ').trim(); // remove additional spaces
      return node;
    });
  }

  private handleModifierSpacing(modifier: TextModifier): [string, string] {
    if (modifier === 'small') return ['', ''];

    return [' ', ' '];
  }
}
