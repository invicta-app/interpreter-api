export type TableOfContents = Array<Segment>;

export type Segment = {
  class?: string;
  title: string;
  section_reference_id: string;
  sequence: number;
  source_reference: string;
  child_segments?: Array<Segment>;
};

export type TocHref = {
  href: string;
  type: 'ncx' | 'section';
};
