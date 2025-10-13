import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { user_role, user_status } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(user_role)
  role?: user_role;

  @IsOptional()
  @IsEnum(user_status)
  status?: user_status;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}