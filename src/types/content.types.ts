export interface Content {
  title: string;
  href: string;
  href_id: string;
  parent_css_class: string;
  child_css_class: string;
}

export type ContentPartial = Partial<Content> &
  Pick<Content, 'href' | 'href_id'>;
