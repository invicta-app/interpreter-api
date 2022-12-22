export interface Content {
  title: string;
  href: string;
  href_id: string;
  parent_css_class: string;
  child_css_class: string;
}

export type ContentPartial = Partial<Content> &
  Pick<Content, 'href' | 'href_id'>;

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
