import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import { ParserDto } from './dto/parser.dto';
import { ContentOpfService } from './services/content.opf.service';
import { TocService } from './services/toc.service';

@Injectable()
export class ParserService {
  constructor(
    private contentOpfService: ContentOpfService,
    private tocService: TocService,
  ) {}

  async create(parserDto: ParserDto) {
    const { ref_id, section } = parserDto;
    const rootPath: string = process.env.EPUB_URL + `/${ref_id}`;

    const metadata = await this.contentOpfService.processContentOpf(rootPath);
    const tableOfContents = await this.tocService.processTocNcx(rootPath);
    this.getHTML(rootPath + '/' + tableOfContents[section].content_directory);

    return tableOfContents;
  }

  async getHTML(htmlPath: string) {
    const hash = htmlPath.lastIndexOf('#');
    const htmlId = htmlPath.slice(hash);
    const path = htmlPath.replace(htmlId, '');

    const forcePath =
      '/Users/marcelo.mantilla/Programming/invicta-app/interpreter-api/epub/why-we-sleep.invicta.epub/text/part0022_split_001.html';

    const html = await fs.readFile(path, 'utf8');

    console.log('path:', path);
    console.log('force path:', forcePath);

    console.log(html);

    return html;
  }

  private async saveDocument() {
    return;
  }
}

// Content Directory var
// Find necessary data for each given EPUB
// Create object maps FOR each
// once with a directory, use the file names to read files and aggregate dat
