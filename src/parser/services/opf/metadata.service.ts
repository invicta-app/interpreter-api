import { Injectable } from '@nestjs/common';
import { OpfMetadata } from '../../../../types/opf/opf.type';
import { Metadata, MetadataIdentifiers } from '../../types/metadata.type';

@Injectable()
export class MetadataService {
  async processMetadata(metadata: OpfMetadata) {
    const map = {};

    map['title'] = metadata['dc:title'];
    map['language'] = metadata['dc:language'];
    map['author'] = metadata['dc:creator'].text;
    map['subjects'] = metadata['dc:subject'];
    map['publisher'] = metadata['dc:publisher'];
    map['description_html'] = metadata['dc:description'];
    map['date_published'] = metadata['dc:date'];

    const identifiers = this.getIdentifiers(metadata['dc:identifier']);
    return { ...map, ...identifiers } as Metadata;
  }

  private getIdentifiers(identifiers: Array<any>) {
    const identifiersObj = {};
    identifiers.map((id) => {
      const scheme = this.mapIdentifiers(id['opf:scheme']);
      identifiersObj[scheme] = id.text;
    });

    return identifiersObj as MetadataIdentifiers;
  }

  private mapIdentifiers(scheme: string) {
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
