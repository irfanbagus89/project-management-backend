import { IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateCommentDto {
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  taskId: string;

  @IsNotEmpty()
  body: string;

  @IsOptional()
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  replyToId?: string;
}
