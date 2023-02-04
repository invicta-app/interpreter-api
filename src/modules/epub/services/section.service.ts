import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ISection } from '../../../types/section.interface';
import { isArray } from '../../../helpers/validatePrimitives';
import {
  ContentBlock,
  IContent,
  TextModifier,
} from '../../../types/content.types';
import { ParserService } from '../../parser/parser.service';

@Injectable()
export class SectionService {
  constructor(private parser: ParserService) {}

  processSectionFile(xml: any) {
    let nodes = this.drillXml(xml);
    nodes = this.squashNodes(nodes);
    nodes = this.formatNodes(nodes);

    const section: Partial<ISection> = {
      content: nodes,
      length: nodes?.length,
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
    if (node?.title) return;
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
    if (node?.em) return this.handleTextModifier(node, 'em');
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
        'CRAP!',
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
  }

  private joinNodes(nodes: Array<string>) {
    return nodes.join(' ').toString();
  }

  private formatNodes(nodes: Array<any>): any {
    if (this.parser.isStringArray(nodes)) return nodes;

    return nodes.map((node, index) => {
      node.sequence = index;
      node.text = node.text.replace(/\s\s+/g, ' ').trim(); // remove additional spaces

      const contentTypes = node.metadata.content_types;
      if (contentTypes?.length)
        node.metadata.content_types = this.getDistinct(contentTypes);

      return node;
    });
  }

  private squashNodes(nodes: Array<IContent>) {
    const newNodes = [];
    const mergeableNodes = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (this.isMergeable(node)) mergeableNodes.push(node);
      else {
        const mergedNodes = this.handleMergeableNodes(mergeableNodes);
        if (mergedNodes) newNodes.push(mergedNodes);
        mergeableNodes.length = 0; // resets mergeable nodes
        newNodes.push(node);
      }

      if (i === nodes.length - 1 && mergeableNodes.length)
        // if last iteration
        newNodes.push(this.handleMergeableNodes(mergeableNodes));
    }

    return newNodes;
  }

  private handleMergeableNodes(nodes: Array<IContent>) {
    if (nodes.length === 0) return null;
    if (nodes.length === 1) return nodes[0];
    if (nodes.length > 1) return this.mergeNodes(nodes);
  }

  private isMergeable(node: IContent) {
    if (node.text.length < 100) {
      // Text Cases
      if (node.text.startsWith('•')) return true;
      if (node.text.startsWith('⁃')) return true;
      if (node.text.startsWith('·')) return true;
      if (node.text.match(/^\d/)) return true; // start with number
      if (node.text.endsWith(',')) return true;
      if (node.text.endsWith(':')) return true;
      if (node.text.endsWith('?')) return false;
      if (node.text.endsWith(';')) return false;

      if (this.parser.isTextHeader(node)) return false;
      if (this.parser.isTextBlock(node)) return true;

      // Default Case
      if (!node.text.endsWith('.')) return true;
    } else return false;
  }

  private mergeNodes(nodes: Array<IContent>): Partial<IContent> {
    let text = nodes[0].text;
    const content_type = nodes[0].content_type;
    const metadata: any = nodes[0].metadata;

    for (let i = 1; i < nodes.length; i++) {
      text = text.concat('\n', nodes[i].text);
      metadata.content_types ||= [];
      metadata.content_types.push(nodes[i].content_type);
    }

    return {
      text,
      content_type,
      metadata,
    };
  }

  private getDistinct(arr: Array<any>) {
    return arr.filter((v, i, a) => a.indexOf(v) === i);
  }
}
