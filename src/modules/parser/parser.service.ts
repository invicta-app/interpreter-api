import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ContentMetadata,
  IContent,
  NodeMetadata,
  TextModifier,
} from '../../types/content.types';

@Injectable()
export class ParserService {
  processText(text: string): string {
    let processedText = text;

    if (typeof text === 'number') processedText = processedText.toString();

    processedText = processedText.replace('&nbsp;', ' ');
    processedText = processedText.replace('&#160;', ' ');
    processedText = processedText.replace('NBSP', ' ');

    return processedText;
  }

  handleModifierSpacing(text: string, modifier: TextModifier): string {
    const [before, after] = ['', ''];

    // TODO - zero functionality at the moment
    if (modifier === 'span') return `${before}${text}${after}`;
    if (modifier === 'i') return `${before}*${text}*${after}`;
    if (modifier === 'emphasize') return `${before}**${text}**${after}`;
    if (modifier === 'em') return `${before}**${text}**${after}`;
    if (modifier === 'strong') return `${before}**${text}**${after}`;
    if (modifier === 'q') return `${before}**${text}**${after}`;
    if (modifier === 'a') return `${before}${text}${after}`; // TODO
    if (modifier === 'br') return `\n`; // TODO
    if (modifier === 'small') return `${before}${text}${after}`;

    throw new InternalServerErrorException(
      `Unidentified text modifier: ${modifier}`,
    );
  }

  handleMetadata(node) {
    const raw: NodeMetadata = node[':@'];
    const metadata: ContentMetadata = {};

    if (raw?.id) metadata.ref_id = raw.id;
    if (raw?.href) metadata.href = raw.href;

    return metadata;
  }

  isStringArray(nodes: any) {
    return nodes.every((node) => typeof node === 'string');
  }

  isTextBlock(node: IContent): boolean {
    const type = node.content_type;

    if (type === 'p' || type === 'blockquote') {
      return true;
    } else return false;
  }

  isTextModifier(node: IContent): boolean {
    const type = node.content_type;

    if (
      type === 'i' ||
      type === 'q' ||
      type === 'a' ||
      type === 'strong' ||
      type === 'span' ||
      type === 'emphasize' ||
      type === 'em' ||
      type === 'br' ||
      type === 'small'
    ) {
      return true;
    } else return false;
  }

  isTextHeader(node: IContent): boolean {
    const type = node.content_type;

    if (
      type === 'h1' ||
      type === 'h2' ||
      type === 'h3' ||
      type === 'h4' ||
      type === 'h5' ||
      type === 'h6' ||
      type === 'title'
    ) {
      return true;
    } else return false;
  }
}
