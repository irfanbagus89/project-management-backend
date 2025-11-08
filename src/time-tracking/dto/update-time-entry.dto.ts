import { IsOptional, IsInt, IsString } from 'class-validator';

export class UpdateTimeEntryDto {
  @IsOptional()
  @IsInt()
  minutes?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
