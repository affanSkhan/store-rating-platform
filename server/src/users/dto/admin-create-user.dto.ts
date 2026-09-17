import { IsEmail, IsEnum, IsString, Length, MaxLength, Matches } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { PASSWORD_PATTERN } from '../../auth/dto/signup.dto';

export class AdminCreateUserDto {
  @IsString()
  @Length(20, 60)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(400)
  address!: string;

  @IsString()
  @Matches(PASSWORD_PATTERN)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
