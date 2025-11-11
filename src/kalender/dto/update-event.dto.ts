import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';
import { SourceCalendar } from '@prisma/client';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  source?: SourceCalendar;

  @IsOptional()
  @IsString()
  externalId?: string;
}
