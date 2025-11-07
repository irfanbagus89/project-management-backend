import { IsOptional, IsString } from 'class-validator';

export class FilterProjectDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
