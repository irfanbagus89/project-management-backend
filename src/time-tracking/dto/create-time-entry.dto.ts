import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateTimeEntryDto {
  @IsNotEmpty()
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  taskId: string;

  @IsDateString()
  date: string;

  @IsInt()
  minutes: number;

  @IsOptional()
  @IsString()
  note?: string;
}
