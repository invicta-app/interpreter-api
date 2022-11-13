import { IsNotEmpty, IsString } from 'class-validator';

export class SectionDto {
  @IsNotEmpty()
  @IsString()
  section_number: number;

  @IsNotEmpty()
  @IsString()
  volume_id: string;
}
