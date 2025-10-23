import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  sessionId: string;

  @IsNotEmpty()
  @MinLength(6)
  code: string;
}
