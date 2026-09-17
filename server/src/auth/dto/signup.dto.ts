import { IsEmail, IsString, Length, MaxLength, Matches } from 'class-validator';

export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export class SignupDto {
  @IsString()
  @Length(20, 60)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(400)
  address!: string;

  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message: 'Password must be 8-16 characters with at least one uppercase letter and one special character',
  })
  password!: string;
}
