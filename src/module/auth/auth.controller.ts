import { Controller, Post, Body, Res } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import express from 'express';
import { Public } from 'common/decorators/public.decorator';
import { ApiSuccess } from 'common/decorators';
import { RegisterUserUseCase } from './use-cases/register-user.usecase';
import { LoginUserUseCase } from './use-cases/login-user.usecase';
import { VerifyAccountUseCase } from './use-cases/verify-account.usecase';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly verifyAccountUseCase: VerifyAccountUseCase,
  ) {}

  @Public()
  @Post('register')
  @ApiSuccess(
    'Account registered successfully. Please check your email for verification.',
  )
  async register(@Body() dto: RegisterDto) {
    const result = await this.registerUserUseCase.execute(dto);
    return {
      message: 'Registration successful. Please check your email for verification code.',
    };
  }

  @Public()
  @Post('login')
  @ApiSuccess('Login successful')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.loginUserUseCase.execute(dto);
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    return {
      access_token: result.access_token,
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
      },
    };
  }

  @Public()
  @Post('verify')
  @ApiSuccess('Account verified successfully')
  async verify(@Body() body: VerifyEmailDto) {
    await this.verifyAccountUseCase.execute(body);
  }
}
