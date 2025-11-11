import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ReminderChannel } from '@prisma/client';

export class UpdateReminderDto {
  @IsOptional()
  @IsDateString()
  remindAt?: string;

  @IsOptional()
  @IsEnum(ReminderChannel)
  channel?: ReminderChannel;
}
