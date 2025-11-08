import { IsOptional, IsString, Matches, IsInt } from 'class-validator';

export class UploadAttachmentDto {
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  orgId: string;

  @IsOptional()
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  projectId?: string;

  @IsOptional()
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  taskId?: string;

  @IsString()
  filename: string;

  @IsString()
  mime: string;

  @IsInt()
  size: number;

  @IsString()
  storageKey: string;
}
