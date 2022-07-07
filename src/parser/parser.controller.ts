import { Controller, Post, Body } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserDto } from './dto/parser.dto';

@Controller('parse')
export class ParserController {
  constructor(private readonly parserService: ParserService) {}

  @Post()
  create(@Body() parserDto: ParserDto) {
    return this.parserService.create(parserDto);
  }
}
