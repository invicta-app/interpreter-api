export interface Manifest {
  text?: Array<ManifestItem>;
  css?: Array<ManifestItem>;
  image?: Array<ManifestItem>;
  font?: Array<ManifestItem>;
}

export enum ManifestTypes {
  TEXT = 'application/xhtml+xml',
  CSS = 'text/css',
  IMAGE = 'image/jpeg',
  FONT = 'application/vnd.ms-opentype',
}

export interface ManifestItem {
  href: string;
  id: string;
  media_type: string;
  order?: number;
  text?: string;
}
