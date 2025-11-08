import { IsArray, Matches } from 'class-validator';
export class SetTaskLabelsDto {
  @IsArray()
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  labelIds: string[];
}
