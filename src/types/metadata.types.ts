export type Metadata = {
  title: string;
  language: string;
  author?: string;
  subjects: Array<string>;
  publisher: string;
  description?: string;
  description_html?: string;
  date_published: string;
  rights?: string;
  identifiers: Array<{ id: string; type: string }>;
  contributors: Array<{ contributor: string; type: string }>;
  content_count: number;
  section_count: number;
};

export type MetadataIdentifiers = {
  isbn?: string;
  mobi_asin?: string;
  uuid?: string;
};
