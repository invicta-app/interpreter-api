import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ISection } from '../../../types/section.interface';
import { isArray } from '../../../helpers/validatePrimitives';
import { ContentBlock, TextModifier } from '../../../types/content.types';
import { ParserService } from '../../parser/parser.service';

@Injectable()
export class SectionService {
  constructor(private parser: ParserService) {}

  processSectionFile(xml: any) {
    const nodes = this.drillXml(xml);
    const content = this.formatNodes(nodes);

    const section: Partial<ISection> = {
      content: content,
      length: content?.length,
    };

    return section as Partial<ISection>;
  }

  private drillXml(node: any) {
    if (isArray(node)) {
      let nodes = node.map((n) => this.drillXml(n));
      nodes = nodes.filter((n) => n);
      nodes = nodes.filter((n) => n.text !== '');
      nodes = nodes.flat();

      return nodes;
    }

    // Unique Elements
    if (node?.text && node?.contentType) return node;
    if (node?.text) return this.parser.processText(node.text);

    // Higher Level XML Components
    if (node?.html) return this.drillXml(node.html);
    if (node?.head) return this.drillXml(node.head);
    if (node?.body) return this.drillXml(node.body);
    if (node?.section) return this.drillXml(node.section);
    if (node?.div) return this.drillXml(node.div);

    // Content Blocks
    if (node?.p) return this.handleContentBlock(node, 'p');
    if (node?.title) return this.handleContentBlock(node, 'title');
    if (node?.blockquote) return this.handleContentBlock(node, 'blockquote');
    if (node?.h1) return this.handleContentBlock(node, 'h1');
    if (node?.h2) return this.handleContentBlock(node, 'h2');
    if (node?.h3) return this.handleContentBlock(node, 'h3');
    if (node?.h4) return this.handleContentBlock(node, 'h4');
    if (node?.h5) return this.handleContentBlock(node, 'h5');
    if (node?.h6) return this.handleContentBlock(node, 'h6');

    // Text Modifiers
    if (node?.span) return this.handleTextModifier(node, 'span');
    if (node?.i) return this.handleTextModifier(node, 'i');
    if (node?.q) return this.handleTextModifier(node, 'q');
    if (node?.a) return this.handleTextModifier(node, 'a');
    if (node?.strong) return this.handleTextModifier(node, 'strong');
    if (node?.br) return this.handleTextModifier(node, 'br');
    if (node?.small) return this.handleTextModifier(node, 'small');
  }

  private handleContentBlock(node, contentType: ContentBlock) {
    const child = node[contentType];
    const response = this.drillXml(child);
    const metadata = this.parser.handleMetadata(node);

    if (!response) return;

    if (this.parser.isStringArray(response)) {
      return {
        text: response.join(' '),
        content_type: contentType,
        metadata: metadata,
      };
    }

    if (response[1]) {
      console.log('NODES:', node);
      throw new InternalServerErrorException(
        'FUCK!',
        'multiple content nodes are possible.',
      );
    }

    response[0].metadata = metadata;
    response[0].metadata.content_types ||= [];
    response[0].metadata.content_types.push(contentType);
    return response[0];
  }

  private handleTextModifier(node, modifier?: TextModifier) {
    const child = node[modifier];
    const nodes = this.drillXml(child);
    const rawText = this.joinNodes(nodes);

    return this.parser.handleModifierSpacing(rawText, modifier);

    // TODO - IMPORANT!!!
    // return {
    //   text,
    //   metadata: this.handleMetadata(node),
    // };
  }

  private joinNodes(nodes: Array<string>) {
    return nodes.join(' ').toString();
  }

  private formatNodes(nodes: Array<any>): any {
    if (this.parser.isStringArray(nodes)) return nodes;

    return nodes.map((node, index) => {
      node.sequence = index;
      node.text = node.text.replace(/\s\s+/g, ' ').trim(); // remove additional spaces
      return node;
    });
  }
}
