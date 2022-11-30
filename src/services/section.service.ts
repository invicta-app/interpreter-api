import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ManifestItem } from '../types/manifest.types';
import { ISection } from '../types/section.interface';
import { processXml } from '../xml/xml-processor';
import { isArray } from '../helpers/validatePrimitives';
import { ContentBlock, TextModifier } from '../types/content.types';
// https://www.npmjs.com/package/grammarify ?

@Injectable()
export class SectionService {
  async createSection(item: ManifestItem, fileAsString: string) {
    const xml = await processXml(fileAsString, { preserveOrder: true });

    const content = await this.drillXml(xml);

    console.log(JSON.stringify(xml, null, 2));

    const section: ISection = {
      id: item.id,
      text: content,
      body_id: xml?.html?.body?.id,
      body_class: xml?.html?.body?.class,
      position: item.order,
    };

    return section as ISection;
  }

  private drillXml(node: any, parent?: string) {
    if (isArray(node)) {
      let nodes = node.map((n) => this.drillXml(n));
      nodes = nodes.filter((n) => n);
      nodes = nodes.flat();

      // return nodes; // temp

      return this.appendSequence(nodes);
    }

    // Unique Elements
    if (node?.text) return this.processText(node.text);

    // Higher Level XML Components
    if (node?.html) return this.drillXml(node.html);
    if (node?.body) return this.drillXml(node.body);
    if (node?.section) return this.drillXml(node.section);
    if (node?.div) return this.drillXml(node.div);

    // Text Groups
    if (node?.p) return this.handleContentBlock(node.p, 'paragraph');
    if (node?.title) return this.handleContentBlock(node.title, 'title');
    if (node?.blockquote)
      return this.handleContentBlock(node.blockquote, 'blockquote');

    // Text Headers
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
  }

  handleContentBlock(node, contentType: ContentBlock) {
    const text = this.drillXml(node).join(' ');

    // text = handleJoin(text: Array<string>)

    return {
      text: text,
      content_type: contentType,
      length: text.length,
      metadata: {},
    };
  }

  handleTextModifier(node, modifier?: TextModifier) {
    const text = this.drillXml(node).join(' ').toString();

    // retrieve parent node
    // compare before and after nodes
    // append space before/after conditionally

    const before = '';
    const after = '';

    if (modifier === 'span') return `${before}${text}${after}`;
    if (modifier === 'italicize') return `${before}*${text}*${after}`;
    if (modifier === 'emphasize') return `${before}**${text}**${after}`;
    if (modifier === 'strong') return `${before}**${text}**${after}`;
    if (modifier === 'quote') return `${before}**${text}**${after}`;
    if (modifier === 'link') return `${before}${text}[${''}${after}]`; // TODO
    if (modifier === 'break') return `\n`; // TODO

    throw new InternalServerErrorException(
      `Unidentified text modifier: ${modifier}`,
    );
  }

  processText(text: string): string {
    let processedText = text;

    if (typeof text === 'number') processedText = processedText.toString();

    processedText = processedText.replace('&nbsp;', ' ');
    processedText = processedText.replace('&#160;', ' ');

    return processedText;
  }

  appendSequence(nodes: Array<any>) {
    const isStringArray = nodes.every((node) => typeof node === 'string');

    console.log('is string?:', isStringArray);
    console.log('nodes?:', nodes);

    if (isStringArray) return nodes;

    return nodes.map((node, index) => {
      node.sequence = index;
      return node;
    });
  }
}
