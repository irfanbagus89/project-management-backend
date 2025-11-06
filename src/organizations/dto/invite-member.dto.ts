import { IsNotEmpty } from 'class-validator';

export class InviteMemberDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  roleId: string;
}
