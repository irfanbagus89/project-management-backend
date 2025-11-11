import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateActivityDto {
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  orgId: string;

  @IsOptional()
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  actorId?: string;

  @IsString()
  @IsNotEmpty()
  entityType: string; // e.g. "task", "project"

  @IsString()
  @IsNotEmpty()
  entityId: string;

  @IsString()
  @IsNotEmpty()
  action: string; // e.g. "created", "updated", "deleted"

  @IsOptional()
  before?: string;

  @IsOptional()
  after?: string;
}
