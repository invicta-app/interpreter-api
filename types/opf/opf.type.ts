export interface Opf {
  package: {
    metadata: OpfMetadata;
    manifest: OpfManifest;
    spine: OpfSpine;
    guide: OpfGuide;
  };
}

export interface OpfMetadata {
  'dc:contributor': any;
  'dc:publisher': any;
  'dc:creator': any;
  'dc:title': any;
  'dc:date': any;
  'dc:language': any;
  'dc:identifier': any;
}

export interface OpfManifest {
  item: Array<OpfManifestItem>;
}

export interface OpfSpine {
  itemref: Array<any>;
  toc?: string;
}

export interface OpfGuide {
  reference: Array<any>;
}

export interface OpfManifestItem {
  href: string;
  id: string;
  'media-type': string;
}
