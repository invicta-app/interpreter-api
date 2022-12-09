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
  | 'italicize'
  | 'quote'
  | 'link'
  | 'strong'
  | 'span'
  | 'emphasize'
  | 'break'
  | 'small';

export type TextHeader =
  | 'header_1'
  | 'header_2'
  | 'header_3'
  | 'header_4'
  | 'header_5'
  | 'header_6';

export type TextBlock = 'paragraph' | 'title' | 'blockquote';

export type ContentBlock = TextBlock | TextHeader;
