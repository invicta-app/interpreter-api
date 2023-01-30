import { Injectable } from '@nestjs/common';
import { OpfMetadata } from '../../../types/opf.type';
import { Metadata, MetadataIdentifiers } from '../../../types/metadata.types';

@Injectable()
export class MetadataService {
  processMetadata(metadata: OpfMetadata) {
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

  private getContributors(list: any) {
    if (!list) return null;

    if (typeof list === 'object')
      return [{ contributor: list.text, type: list.id }];

    const contributors = [];
    list.forEach((contributor) => {
      contributors.push({
        contributor: contributor.text,
        type: contributor.id,
      });
    });

    return contributors;
  }

  private getIdentifiers(identifiers: any) {
    if (typeof identifiers === 'object') {
      if (identifiers.text && identifiers.id) return [identifiers];
      return;
    }

    const arr: Array<{ id: string; type: string }> = [];

    identifiers.map((id) => {
      if (typeof id === 'string') {
        if (id.includes('uuid')) arr.push({ type: 'uuid', id });
        if (id.includes('uuid_id')) arr.push({ type: 'uuid', id });
        else if (id.includes('isbn')) arr.push({ type: 'isbn', id });
        else if (id.includes('mobi')) arr.push({ type: 'mobi_asin', id });
        else if (id.includes('calibre')) arr.push({ type: 'calibre', id });
        else if (id.includes('url')) arr.push({ type: 'url', id });
        else arr.push({ type: 'misc', id });
      } else if (id.text && id.id) {
        arr.push({ type: id.id, id: id.text });
      } else if (id['opf:scheme'])
        arr.push({ type: this.mapOpfScheme(id['opf:scheme']), id: id.text });
    });

    return arr as Array<{ id: string; type: string }>;
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
      case 'ISBN':
        return 'isbn';
      case 'MOBI-ASIN':
        return 'mobi_asin';
      default:
        return;
    }
  }
}
