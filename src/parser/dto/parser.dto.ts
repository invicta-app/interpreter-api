import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ParserDto {
  @IsNotEmpty()
  @IsString()
  ref_id: string;

  @IsNumber()
  @IsOptional()
  section?: number;
}
