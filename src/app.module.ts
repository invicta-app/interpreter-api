import { Module } from '@nestjs/common';
import { StreamModule } from './stream/stream.module';
import { RouterModule } from '@nestjs/core';
import { OpfModule } from './modules/opf/opf.module';
import { UploadModule } from './download/upload.module';
import { EpubModule } from './modules/epub/epub.module';

@Module({
  imports: [
    StreamModule,
    OpfModule,
    UploadModule,
    EpubModule,
    RouterModule.register([
      { path: 'api/v1', module: StreamModule },
      { path: 'api/v1', module: UploadModule },
    ]),
  ],
  providers: [],
})
export class AppModule {}
