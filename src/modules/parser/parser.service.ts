import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ContentMetadata,
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

    return processedText;
  }

  handleModifierSpacing(text: string, modifier: TextModifier): string {
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
}
