import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
export class CreateLabelDto {
  @Matches(/^c[a-z0-9]{24}$/, { message: 'projectId must be a valid CUID' })
  projectId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  color?: string;
}
