export interface OpfObject {
  package: {
    metadata: OpfMetadata;
    manifest: OpfManifest;
    spine: OpfSpine;
    guide: OpfGuide;
  };
}

export interface OpfMetadata {
  'dc:contributor'?: Array<{ id: string; text: string }>;
  'dc:publisher'?: any;
  'dc:creator': any;
  'dc:title': any;
  'dc:date': any;
  'dc:language': any;
  'dc:identifier': any;
  'dc:rights'?: any;
  'dc:source'?: any;
  'dc:subject'?: any;
}

export interface OpfManifest {
  item: Array<OpfManifestItem>;
}

export interface OpfSpine {
  itemref: Array<{ idref: string }>;
  toc?: string;
}

export interface OpfGuide {
  reference: Array<OpfGuideItem>;
}

export interface OpfGuideItem {
  href: string;
  title: string;
  type: 'text' | 'cover' | 'toc';
}

export interface OpfManifestItem {
  href: string;
  id: string;
  'media-type': string;
}
