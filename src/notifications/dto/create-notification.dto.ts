import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateNotificationDto {
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  orgId: string;

  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string; // e.g., 'task_assigned', 'comment_added'

  @IsNotEmpty()
  payload: string;

  @IsOptional()
  isRead?: boolean;
}
