import { IsEnum } from 'class-validator';
import { SprintState } from '@prisma/client';

export class ChangeStateDto {
  @IsEnum(SprintState)
  state: SprintState; // planned | active | closed
}
