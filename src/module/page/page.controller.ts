import {
  Controller,
  Get,
  Post,
  Render,
  Query,
  Body,
  Res,
  Req,
} from '@nestjs/common';
import { Public } from 'app/common/decorators/public.decorator';
import { RegisterUserUseCase } from '../auth/use-cases/register-user.usecase';
import { LoginUserUseCase } from '../auth/use-cases/login-user.usecase';
import { VerifyAccountUseCase } from '../auth/use-cases/verify-account.usecase';
import { ResendVerificationUseCase } from '../auth/use-cases/resend-verification.usecase';
import { VerificationSessionService } from '../auth/service/verification-session.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { AuthTokenService } from '../auth/service/auth-token.service';
import express from 'express';

@Controller()
export class PageController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly verifyAccountUseCase: VerifyAccountUseCase,
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly authTokenService: AuthTokenService,
  ) {}

  @Get()
  @Public()
  @Render('pages/home')
  home() {
    return {
      title: 'Home - MyApp',
      message: null,
      user: null, // Will be populated when user is authenticated
    };
  }

  @Get('login')
  @Public()
  @Render('pages/login')
  getLogin() {
    return {
      title: 'Login - MyApp',
      error: null,
    };
  }

  @Post('login')
  @Public()
  async postLogin(@Body() dto: LoginDto, @Res() res: express.Response) {
    try {
      const result = await this.loginUserUseCase.execute(dto);

      if (result.requiresVerification) {
        // Create verification session for unverified user
        const sessionId = await this.verificationSessionService.createSession(
          result.user.email,
        );

        // Set session cookie
        res.cookie('_sid', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000, // 15 minutes
          sameSite: 'strict',
        });

        return res.redirect(
          '/verify?message=' +
            encodeURIComponent('Please verify your email before logging in.'),
        );
      }

      // Set tokens in cookies for successful login
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to home
      return res.redirect('/');
    } catch (error) {
      // Redirect back to login with error
      const errorMessage = error.message || 'Login failed';
      return res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  @Get('register')
  @Public()
  @Render('pages/register')
  getRegister(@Query('error') error?: string) {
    return {
      title: 'Register - MyApp',
      error: error || null,
    };
  }

  @Post('register')
  @Public()
  async postRegister(@Body() dto: RegisterDto, @Res() res: express.Response) {
    try {
      const result = await this.registerUserUseCase.execute(dto);

      // Set session cookie with obscure name (_sid looks like session ID)
      // Contains random session ID, not email
      res.cookie('_sid', result.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: 'strict',
      });

      // Redirect to verify page (no data in URL)
      return res.redirect('/verify');
    } catch (error) {
      // Redirect back to register with error
      const errorMessage = error.message || 'Registration failed';
      return res.redirect(
        `/register?error=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Get('verify')
  @Public()
  @Render('pages/verify')
  getVerify(@Query('error') error?: string, @Req() req?: express.Request) {
    // Check if session cookie exists
    const hasSession = !!req?.cookies?._sid;

    return {
      title: 'Verify Account - MyApp',
      hasSession, // Used in template to show/hide email input
      error: error || null,
    };
  }

  @Post('verify')
  @Public()
  async postVerify(
    @Body() body: { code: string },
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      // Get session ID from cookie
      const sessionId = req.cookies?._sid;

      if (!sessionId) {
        return res.redirect(
          '/verify?error=' +
            encodeURIComponent('Session expired. Please register again.'),
        );
      }

      await this.verifyAccountUseCase.execute({ sessionId, code: body.code });

      // Clear session cookie after successful verification
      res.clearCookie('_sid');

      // Redirect to login with success message
      return res.redirect(
        '/login?message=' +
          encodeURIComponent(
            'Account verified successfully. You can now login.',
          ),
      );
    } catch (error) {
      // Redirect back to verify with error
      const errorMessage = error.message || 'Verification failed';
      return res.redirect(`/verify?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  @Get('resend-verification')
  @Public()
  @Render('pages/resend')
  getResendVerification(
    @Query('error') error?: string,
    @Query('success') success?: string,
    @Req() req?: express.Request,
  ) {
    // Check if session cookie exists
    const hasSession = !!req?.cookies?._sid;

    return {
      title: 'Resend Verification - MyApp',
      hasSession,
      error,
      success,
    };
  }

  @Post('resend-verification')
  @Public()
  async postResendVerification(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      // Get session ID from cookie
      const sessionId = req.cookies?._sid;

      if (!sessionId) {
        return res.redirect(
          '/resend-verification?error=' +
            encodeURIComponent(
              'Session expired. Please register or login again.',
            ),
        );
      }

      await this.resendVerificationUseCase.execute({ sessionId });

      // Redirect back with success message
      return res.redirect(
        '/resend-verification?success=' +
          encodeURIComponent(
            'Verification email sent successfully. Please check your email.',
          ),
      );
    } catch (error) {
      // Redirect back with error
      const errorMessage = error.message || 'Failed to send verification email';
      return res.redirect(
        '/resend-verification?error=' + encodeURIComponent(errorMessage),
      );
    }
  }
}
