import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  Matches,
} from 'class-validator';
import { TaskPriority, TaskType } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  projectId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.med;

  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType = TaskType.task;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @IsUUID()
  statusId?: string; // WorkflowStatus

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  estimateHours?: number;
}
