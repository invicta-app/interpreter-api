import { Module } from '@nestjs/common';
import { ParserModule } from './parser/parser.module';

@Module({
  imports: [ParserModule],
  providers: [],
})
export class AppModule {}
