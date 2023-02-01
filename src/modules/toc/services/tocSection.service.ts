import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Segment, TableOfContents } from '../../../types/tableOfContents.types';
import { isArray } from '../../../helpers/validatePrimitives';
import {
  ContentBlock,
  ContentMetadata,
  NodeMetadata,
  TextModifier,
} from '../../../types/content.types';
import { splitFileHref } from '../../../helpers/splitFileHref';
import { ParserService } from '../../parser/parser.service';

@Injectable()
export class TocSectionService {
  constructor(private parser: ParserService) {}

  async processTocFile(tocObj: any) {
    const segments: Array<Segment> = this.drillXml(tocObj);

    return this.formatSegments(segments) as TableOfContents;
  }

  private drillXml(node: any) {
    if (isArray(node)) {
      let nodes = node.map((n) => this.drillXml(n));
      nodes = nodes.filter((n) => n);
      nodes = nodes.flat();
      return nodes;
    }

    // Unique Elements
    if (node?.text) return this.parser.processText(node.text);

    // Higher Level XML Components
    if (node?.html) return this.drillXml(node.html);
    if (node?.head) return this.drillXml(node.head);
    if (node?.body) return this.drillXml(node.body);
    if (node?.section) return this.drillXml(node.section);
    if (node?.div) return this.drillXml(node.div);

    // Content Blocks
    if (node?.p) return this.handleSegmentBlock(node, 'p');
    if (node?.a) return this.handleHrefNode(node);

    if (node?.title) return this.handleSegmentBlock(node, 'title');
    if (node?.h1) return this.handleSegmentBlock(node, 'h1');
    if (node?.h2) return this.handleSegmentBlock(node, 'h2');
    if (node?.h3) return this.handleSegmentBlock(node, 'h3');
    if (node?.h4) return this.handleSegmentBlock(node, 'h4');
    if (node?.h5) return this.handleSegmentBlock(node, 'h5');
    if (node?.h6) return this.handleSegmentBlock(node, 'h6');
    if (node?.blockquote) return this.handleSegmentBlock(node, 'blockquote');

    // Text Modifiers
    if (node?.span) return this.handleTextModifier(node, 'span');
    if (node?.i) return this.handleTextModifier(node, 'i');
    if (node?.q) return this.handleTextModifier(node, 'q');
    if (node?.strong) return this.handleTextModifier(node, 'strong');
    if (node?.br) return this.handleTextModifier(node, 'br');
    if (node?.small) return this.handleTextModifier(node, 'small');
  }

  private handleHrefNode(node) {
    const a = node.a[0];
    const text = this.drillXml(a);

    const href = this.parser.handleMetadata(node).href;
    const { href_path, href_id } = splitFileHref(href);

    const segment: Partial<Segment> = {
      title: text,
      section_reference_id: href_path,
      subsection_reference_id: href_id,
    };

    return segment;
  }

  private handleSegmentBlock(node, contentType: ContentBlock) {
    const child = node[contentType];
    const response = this.drillXml(child);

    if (!response) return;
    if (this.parser.isStringArray(response))
      return { title: response.join(' ') };

    return response[0] as Partial<Segment>;
  }

  private handleTextModifier(node, modifier?: TextModifier) {
    const child = node[modifier];
    const nodes = this.drillXml(child);
    const rawText = this.joinNodes(nodes);

    return this.parser.handleModifierSpacing(rawText, modifier);
  }

  private joinNodes(nodes: Array<string>) {
    return nodes.join(' ').toString();
  }

  private processText(text: string): string {
    let processedText = text;

    if (typeof text === 'number') processedText = processedText.toString();

    processedText = processedText.replace('&nbsp;', ' ');
    processedText = processedText.replace('&#160;', ' ');

    return processedText;
  }

  private formatSegments(nodes: Array<any>): any {
    if (this.parser.isStringArray(nodes)) return nodes;

    return nodes.map((node, index) => {
      node.sequence = index;
      node.title = node.title.replace(/\s\s+/g, ' ').trim(); // remove additional spaces
      return node;
    });
  }
}
