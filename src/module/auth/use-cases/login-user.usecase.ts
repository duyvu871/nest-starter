import { Injectable } from '@nestjs/common';
import { User, user_status } from '@prisma/client';
import { NotFoundError, ValidationError } from 'common/response/client-errors';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { PrismaService } from 'infra/prisma/prisma.service';
import { UsersService } from 'module/user/user.service';
import { LoginDto } from '../dto/login.dto';
import { AuthTokenService } from '../service/auth-token.service';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

@Injectable()
export class LoginUserUseCase {
  private readonly errorMessages = {
    INVALID_CREDENTIALS: 'Invalid email/username or password',
    EMAIL_NOT_VERIFIED: 'Please verify your email before logging in',
    ACCOUNT_INACTIVE: 'Account is inactive. Please contact support',
  } as const;

  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    // Find user by email or username
    const user = await this.usersService.findByEmailOrUsername(dto.usernameOrEmail);
    if (!user) {
      throw new NotFoundError(this.errorMessages.INVALID_CREDENTIALS);
    }

    // Validate password
    const isPasswordValid = await this.bcryptService.comparePassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ValidationError(this.errorMessages.INVALID_CREDENTIALS);
    }

    // Validate user can login
    this.validateUserCanLogin(user);

    // Generate tokens
    const tokens = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      username: user.username,
    });

    // Update refresh token in database
    await this.updateUserRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user,
    };
  }

  private validateUserCanLogin(user: User): void {
    if (!user.is_verified) {
      throw new ValidationError(this.errorMessages.EMAIL_NOT_VERIFIED);
    }

    if (user.status !== user_status.ACTIVE) {
      throw new ValidationError(this.errorMessages.ACCOUNT_INACTIVE);
    }
  }

  private async updateUserRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.prismaService.user.update({
      where: { id: userId },
      data: { refresh_token: refreshToken },
    });
  }
}
