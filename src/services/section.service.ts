import { Injectable } from '@nestjs/common';
import { ManifestItem } from '../types/manifest.types';
import { ISection } from '../types/section.interface';
import { processXml } from '../xml/xml-processor';
import { isArray } from '../helpers/validatePrimitives';
// https://www.npmjs.com/package/grammarify ?

@Injectable()
export class SectionService {
  async createSection(item: ManifestItem, fileAsString: string) {
    const xml = await processXml(fileAsString, { preserveOrder: true });

    console.log(JSON.stringify(xml, null, 2)); // IT WORKS !!!
    const content = await this.drillXml(xml);
    // console.log(JSON.stringify(content, null, 2)); // IT WORKS !!!

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

      console.log('nodes:', nodes);
      return this.appendSequence(nodes);
    }

    // Unique Elements
    if (node?.text) return this.processText(node.text);
    if (node?.span) return this.handleSpan(node.span, node);

    // Higher Level XML Components
    if (node?.html) return this.drillXml(node.html);
    if (node?.body) return this.drillXml(node.body);
    if (node?.section) return this.drillXml(node.section);
    if (node?.div) return this.drillXml(node.div);

    // Text Groups
    if (node?.p) return this.handleContentType(node.p, 'paragraph');
    if (node?.title) return this.handleContentType(node.title, 'title');
    if (node?.blockquote)
      return this.handleContentType(node.blockquote, 'blockquote');

    // Text Headers
    if (node?.h1) return this.handleContentType(node.h1, 'header_1');
    if (node?.h2) return this.handleContentType(node.h2, 'header_2');
    if (node?.h3) return this.handleContentType(node.h3, 'header_3');
    if (node?.h4) return this.handleContentType(node.h2, 'header_4');
    if (node?.h5) return this.handleContentType(node.h5, 'header_5');
    if (node?.h6) return this.handleContentType(node.h6, 'header_6');

    // Text Modifiers
    if (node?.i) return this.handleContentType(node.i, 'italicize');
    if (node?.q) return this.handleContentType(node.q, 'quote');
    if (node?.a) return this.handleContentType(node.a, 'link');
    if (node?.s) return this.handleContentType(node.s, 'strong');
    if (node?.strong) return this.handleContentType(node.strong, 'strong');
  }

  processText(text: string): string {
    let processedText = text;

    if (typeof text === 'number') processedText = processedText.toString();

    processedText = processedText.replace('&nbsp;', ' ');
    processedText = processedText.replace('&#160;', ' ');

    return processedText;
  }

  handleContentType(node, contentType) {
    const text = this.drillXml(node).join(' ');

    return {
      text: text,
      content_type: contentType,
      length: text.length,
    };
  }

  handleSpan(span, parentNode) {
    // retrieve modifier
    // compare before and after nodes
    // append space before and/or after conditionally

    return this.drillXml(span);
  }

  handleTextModifier(node, modifier?: string) {
    const xml = this.drillXml(node);

    const x = {
      span: modifier === 'span' || false,
      italicize: modifier === 'italicize' || false,
      quote: modifier === 'italicize' || false,
      emphasize: modifier === 'emphasize' || false,
      links: true, // TBD
      strong: modifier === 'strong' || false,
    };
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
