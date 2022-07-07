import { Module } from '@nestjs/common';
import { ParserModule } from './parser/parser.module';
import { StreamModule } from './epub-streamer/stream.module';
import { RouterModule } from '@nestjs/core';
import { OpfModule } from './opf/opf.module';

@Module({
  imports: [
    ParserModule,
    StreamModule,
    OpfModule,
    RouterModule.register([
      { path: 'api/v1', module: StreamModule },
      { path: 'api/v1', module: ParserModule },
    ]),
  ],
  providers: [],
})
export class AppModule {}
