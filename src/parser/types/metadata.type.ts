export type Metadata = {
  title: string;
  language: string;
  author?: string;
  subjects: Array<string>;
  publisher: string;
  description_html: string;
  date_published: string;
  isbn?: string;
  mobi_asin?: string;
  uuid?: string;
};

export type MetadataIdentifiers = {
  isbn?: string;
  mobi_asin?: string;
  uuid?: string;
};
