import { EmailRequestDto } from './dto/email-request.dto';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): any {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('reverify-email')
  resendVerificationEmail(@Body() dto: EmailRequestDto) {
    return this.authService.resendVerificationEmail(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: EmailRequestDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto): any {
    return this.authService.refreshToken(dto);
  }

  @Post('logout')
  logout() {
    // return this.authService.logout();
  }
}
