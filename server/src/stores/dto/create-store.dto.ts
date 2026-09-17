import { IsEmail, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @Length(3, 120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(400)
  address!: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
