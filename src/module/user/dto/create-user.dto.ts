import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';
import { user_role, user_status } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(user_role)
  role?: user_role;

  @IsOptional()
  @IsEnum(user_status)
  status?: user_status;
}
