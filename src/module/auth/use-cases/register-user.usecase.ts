import { Injectable } from '@nestjs/common';
import { ConflictError } from 'common/response/client-errors/conflict';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { PrismaService } from 'infra/prisma/prisma.service';
import { BaseUseCase } from 'shared/interfaces/base-usecase.interface';
import { UsersService } from 'module/user/user.service';
import { SendVerificationEmailUseCase } from 'module/email/use-cases/send-verification-email.usecase';
import { VerificationService } from 'module/verification/verification.service';
import { VerificationSessionService } from '../service/verification-session.service';
import { RegisterDto } from '../dto/register.dto';
import { User } from '@prisma/client';

export interface RegisterUserResponse {
  user: Pick<User, 'id' | 'email' | 'username' | 'is_verified'>;
  sessionId: string;
}

@Injectable()
export class RegisterUserUseCase
  implements BaseUseCase<RegisterDto, RegisterUserResponse>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly verificationEmailUsecase: SendVerificationEmailUseCase,
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
  ) {}

  async execute(dto: RegisterDto): Promise<RegisterUserResponse> {
    // Validate user doesn't exist
    await this.validateUserDoesNotExist(dto.email, dto.username);

    // Hash password
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);

    // Create user
    const user = await this.prismaService.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        is_verified: true,
      },
    });

    // Create verification session (random ID, not email-based)
    const sessionId = await this.verificationSessionService.createSession(
      dto.email,
    );

    // Send verification email asynchronously
    await this.sendVerificationEmail(dto.email);

    return { user, sessionId };
  }

  private async validateUserDoesNotExist(
    email: string,
    username: string,
  ): Promise<void> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.usersService.findByEmail(email),
      this.usersService.findByUsername(username),
    ]);

    if (existingEmail) {
      throw new ConflictError('An account with this email already exists');
    }

    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    try {
      // Generate a verification code and its expiration time
      const { expiresAt, code } = await this.verificationService.generate({
        namespace: 'email_verification',
        subject: email,
        ttlSec: 15 * 60, // 15 minutes
        length: 6,
        maxAttempts: 5,
        rateLimitMax: 3,
        rateLimitWindowSec: 60 * 15, // 15 minutes
      });
      const ttl = expiresAt - Date.now(); // in milliseconds

      console.log('Verification code', {
        to: email,
        code,
        ttl,
      });

      await this.verificationEmailUsecase.execute({
        to: email,
        code,
        ttl,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  }
}
