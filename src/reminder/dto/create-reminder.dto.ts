import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ReminderChannel } from '@prisma/client';

export class CreateReminderDto {
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  orgId: string;

  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  entityType: 'task' | 'doc';

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsDateString()
  remindAt: string;

  @IsEnum(ReminderChannel)
  channel: ReminderChannel; // 'inapp' | 'email' | 'push'
}
