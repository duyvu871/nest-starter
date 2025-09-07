/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'app/users/users.service';
import { PrismaService } from 'app/prisma/prisma.service';
import {
  ApiResponse,
  ConflictError,
  NotFoundError,
  ValidationError,
} from 'app/common/response';
import { EmailService } from 'app/email/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { EmailRequestDto } from './dto/email-request.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { BcryptService } from 'app/common/helpers/bcrypt.util';
import { CodeService } from 'app/common/helpers/code.util';
import { user_status } from '@prisma/client';
import { TokenService } from './token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly bcryptService: BcryptService,
    private readonly codeService: CodeService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    const hasEmail = await this.userService.findByEmail(dto.email);
    const hasUsername = await this.userService.findByUsername(dto.username);

    if (hasEmail) {
      throw new ConflictError('Email already exists');
    }

    if (hasUsername) {
      throw new ConflictError('Username already exists');
    }

    const { code, expiredAt } = this.codeService.generateCodeWithExpiry();
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);

    // create user
    await this.prismaService.user.create({
      data: {
        ...dto,
        password: hashedPassword,
        verification_code: code,
        verification_code_expired: expiredAt,
      },
    });

    // send email
    setImmediate(() => {
      this.emailService
        .sendVerificationEmail(dto.email, code, expiredAt)
        .catch((err) => console.log(err));
    });

    return ApiResponse.success(null, 'Account registered successfully');
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (user.verification_code !== dto.code) {
      throw new ValidationError('Invalid verification code');
    }
    if (
      !user.verification_code_expired ||
      this.codeService.isCodeExpired(user.verification_code_expired)
    ) {
      throw new ValidationError('Verification code expired');
    }
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        verification_code: null,
        verification_code_expired: null,
        is_verified: true,
      },
    });
    return ApiResponse.success(null, 'Email verified successfully');
  }

  async resendVerificationEmail(dto: EmailRequestDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { code, expiredAt } = this.codeService.generateCodeWithExpiry();
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        verification_code: code,
        verification_code_expired: expiredAt,
      },
    });
    setImmediate(() => {
      this.emailService
        .sendVerificationEmail(dto.email, code, expiredAt)
        .catch((err) => console.log(err));
    });
    return ApiResponse.success(null, 'Verification email sent successfully');
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmailOrUsername(
      dto.usernameOrEmail,
    );
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const isPasswordMatch = await this.bcryptService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new ValidationError('Invalid credentials');
    }
    if (!user.is_verified) {
      throw new ValidationError('Email not verified. Please verify your email');
    }
    if (user.status !== user_status.ACTIVE) {
      throw new ValidationError('Account is not active');
    }
    // payload for token
    const { access_token, refresh_token } = this.tokenService.generateTokenPair(
      {
        id: user.id,
        email: user.email,
      },
    );
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        refresh_token,
      },
    });
    return ApiResponse.success(
      { access_token, refresh_token, user },
      'Login successful',
    );
  }

  async forgotPassword(dto: EmailRequestDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { code, expiredAt } = this.codeService.generateCodeWithExpiry();
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password_reset_code: code,
        password_reset_code_expired: expiredAt,
      },
    });
    setImmediate(() => {
      this.emailService
        .sendForgotPasswordEmail(dto.email, code, expiredAt)
        .catch((err) => console.log(err));
    });
    return ApiResponse.success(null, 'Password reset code sent successfully');
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prismaService.user.findFirst({
      where: {
        password_reset_code: dto.resetToken,
      },
    });
    if (!user) {
      throw new ValidationError('Invalid password reset code');
    }
    if (
      !user.password_reset_code_expired ||
      this.codeService.isCodeExpired(user.password_reset_code_expired)
    ) {
      await this.prismaService.user.update({
        where: { id: user.id },
        data: {
          password_reset_code: null,
          password_reset_code_expired: null,
        },
      });
      throw new ValidationError('Password reset code expired');
    }
    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: await this.bcryptService.hashPassword(dto.password),
        password_reset_code: null,
        password_reset_code_expired: null,
      },
    });
    return ApiResponse.success(null, 'Password reset successfully');
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = this.tokenService.verifyRefreshToken(dto.refresh_token);
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id,
        refresh_token: dto.refresh_token,
      },
    });
    if (!user) {
      throw new ValidationError('Invalid refresh token');
    }
    const { access_token, refresh_token } = this.tokenService.generateTokenPair(
      {
        id: user.id,
        email: user.email,
      },
    );
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        refresh_token,
      },
    });
    return ApiResponse.success(
      { access_token, refresh_token, user },
      'Refresh token successful',
    );
  }
  async logout() {}
}
