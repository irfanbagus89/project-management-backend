import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { SourceCalendar } from '@prisma/client';

export class CreateEventDto {
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  orgId: string;

  @IsOptional()
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  projectId?: string;

  @IsString()
  title: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  endAt: string;

  @IsBoolean()
  @IsOptional()
  allDay?: boolean = false;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  source?: SourceCalendar = SourceCalendar.internal;

  @IsOptional()
  @ValidateIf((o) => o.source !== SourceCalendar.internal)
  @IsString()
  externalId?: string;
}
