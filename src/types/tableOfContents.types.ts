export type TableOfContents = Array<Segment>;

export type Segment = {
  title: string;
  href: string;
  reference_id?: string;
  metadata: any;
  sequence: number;
};

export type TocHref = {
  href: string;
  type: 'ncx' | 'section';
};
