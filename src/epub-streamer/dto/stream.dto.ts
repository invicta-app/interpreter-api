import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StreamDto {
  @IsNotEmpty()
  @IsString()
  volume_id: string;

  @IsOptional()
  url?: string;

  @IsOptional()
  @IsString()
  order?: number;
}
