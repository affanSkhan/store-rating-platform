import { IsString, Matches } from 'class-validator';
import { PASSWORD_PATTERN } from './signup.dto';

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message: 'Password must be 8-16 characters with at least one uppercase letter and one special character',
  })
  newPassword!: string;
}
