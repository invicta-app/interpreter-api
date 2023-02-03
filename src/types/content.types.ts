export type IContent = {
  text: string;
  content_type: TextModifier | TextHeader | TextBlock;
  metadata: any;
  sequence: number;
};

export type TextModifier =
  | 'i'
  | 'q'
  | 'a'
  | 'strong'
  | 'span'
  | 'emphasize'
  | 'em'
  | 'br'
  | 'small';

export type TextHeader = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type TextBlock = 'p' | 'title' | 'blockquote';

export type ContentBlock = TextBlock | TextHeader;

export interface NodeMetadata {
  class?: string;
  id?: string;
  href?: string;
}

export type ContentMetadata = any;
