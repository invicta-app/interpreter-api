import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetSectionDto {
  @IsNotEmpty()
  @IsNumber()
  section: number;
}
