import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ManifestItem } from '../types/manifest.types';
import { ISection } from '../types/section.interface';
import { processXml } from '../helpers/xml-processor';
import { isArray } from '../helpers/validatePrimitives';
import {
  ContentBlock,
  ContentMetadata,
  NodeMetadata,
  TextModifier,
} from '../types/content.types';

@Injectable()
export class SectionService {
  async createSection(item: ManifestItem, fileAsString: string) {
    const xml = await processXml(fileAsString, { preserveOrder: true });

    console.log('XML:', JSON.stringify(xml, null, 2));

    const nodes = await this.drillXml(xml);
    const content = this.formatNodes(nodes);

    const section: Partial<ISection> = {
      ref_id: item.id,
      data: content,
      length: content?.length,
      section: item.order,
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
    if (node?.text) return this.processText(node.text);

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
    const metadata = this.handleMetadata(node);

    if (!response) return;

    if (this.isStringArray(response)) {
      return {
        text: response.join(' '),
        content_type: contentType,
        metadata: metadata,
      };
    }

    if (node[1]) {
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

    const text = this.handleModifierSpacing(rawText, modifier);

    return text;

    // TODO - IMPORANT!!!
    // return {
    //   text,
    //   metadata: this.handleMetadata(node),
    // };
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

  private formatNodes(nodes: Array<any>): any {
    if (this.isStringArray(nodes)) return nodes;

    return nodes.map((node, index) => {
      node.sequence = index;
      node.text = node.text.replace(/\s\s+/g, ' ').trim(); // remove additional spaces
      return node;
    });
  }

  private handleModifierSpacing(text: string, modifier: TextModifier): string {
    const [before, after] = ['', ''];

    if (modifier === 'span') return `${before}${text}${after}`;
    if (modifier === 'i') return `${before}*${text}*${after}`;
    if (modifier === 'emphasize') return `${before}**${text}**${after}`;
    if (modifier === 'strong') return `${before}**${text}**${after}`;
    if (modifier === 'q') return `${before}**${text}**${after}`;
    if (modifier === 'a') return `${before}${text}${after}`; // TODO
    if (modifier === 'br') return `\n`; // TODO
    if (modifier === 'small') return `${before}${text}${after}`;

    throw new InternalServerErrorException(
      `Unidentified text modifier: ${modifier}`,
    );
  }

  private isStringArray(nodes: any) {
    return nodes.every((node) => typeof node === 'string');
  }

  private handleMetadata(node: any) {
    const raw: NodeMetadata = node[':@'];

    console.log('RAW:', raw);

    const metadata: ContentMetadata = {};
    if (raw?.id) metadata.ref_id = raw.id;
    if (raw?.href) metadata.href = raw.href;

    return metadata;
  }
}
