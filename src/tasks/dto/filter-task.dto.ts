import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class FilterTaskDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
