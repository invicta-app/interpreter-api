import { Injectable } from '@nestjs/common';
import { OpfMetadata } from '../../types/opf/opf.type';
import { Metadata, MetadataIdentifiers } from '../../types/metadata.types';

@Injectable()
export class MetadataService {
  async processMetadata(metadata: OpfMetadata) {
    const map = {};

    map['title'] = this.getProperty(metadata['dc:title']);
    map['language'] = this.getProperty(metadata['dc:language']);
    map['author'] = this.getProperty(metadata['dc:creator']);
    map['subjects'] = this.getProperty(metadata['dc:subject']);
    map['description'] = this.getProperty(metadata['dc:description']);
    map['date_published'] = this.getProperty(metadata['dc:date']);
    map['rights'] = this.getProperty(metadata['dc:rights']);
    map['publisher'] = this.getProperty(metadata['dc:publisher'] || null);

    map['contributors'] = this.getContributors(metadata['dc:contributor']);
    map['identifiers'] = this.getIdentifiers(metadata['dc:identifier']);

    return { ...map } as Metadata;
  }

  private getProperty(param: any) {
    // TODO - HANDLE ARRAY TYPES
    if (!param) return;
    if (typeof param === 'string') return param;
    if (param.text) return param.text;
    return;
  }

  private getWithId(param: any) {
    if (!param) return;
    if (typeof param === 'string') return { text: param, type: null };
    if (param?.text && param?.id) return { text: param.id, type: param.id };
    else if (param.text) return { text: param.text, type: null };
  }

  private getContributors(list: Array<{ text: string; id: string }>) {
    if (!list) return null;
    const contributors = [];

    list.forEach((contributor) => {
      contributors.push({
        contributor: contributor.text,
        type: contributor.id,
      });
    });

    return contributors;
  }

  private getIdentifiers(identifierArr: Array<any>) {
    const identifiers = [];

    identifierArr.map((id) => {
      if (typeof id === 'string') {
        if (id.includes('uuid')) identifiers.push({ type: 'uuid', id });
        else if (id.includes('isbn')) identifiers.push({ type: 'isbn', id });
        else if (id.includes('mobi'))
          identifiers.push({ type: 'mobi_asin', id });
        else if (id.includes('calibre'))
          identifiers.push({ type: 'calibre', id });
        else if (id.includes('url')) identifiers.push({ type: 'url', id });
        else identifiers.push({ type: 'misc', id });
      } else if (id.text && id.id) {
        identifiers.push({ type: id.id, id: id.text });
      } else if (id['opf:scheme'])
        identifiers.push({
          type: this.mapOpfScheme(id['opf:scheme']),
          id: id.text,
        });
    });

    return identifiers as Array<{ id: string; type: string }>;
  }

  private mapOpfScheme(scheme: string) {
    if (!scheme) return 'misc';
    switch (scheme.toLowerCase()) {
      case 'isbn':
        return 'isbn';
      case 'mobi-asin':
        return 'mobi_asin';
      case 'uuid':
        return 'uuid';
      default:
        return;
    }
  }
}
