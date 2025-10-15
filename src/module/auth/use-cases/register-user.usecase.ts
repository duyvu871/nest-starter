import { Injectable } from '@nestjs/common';
import { ConflictError } from 'common/response/client-errors/conflict';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { PrismaService } from 'infra/prisma/prisma.service';
import { UsersService } from 'module/user/user.service';
import { VerificationService } from 'module/verification/verification.service';
import { RegisterDto } from '../dto/register.dto';
import { AuthTokenService } from '../service/auth-token.service';
import { SendVerificationEmailUseCase } from 'app/module/email/use-cases/send-verification-email.usecase';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly verificationEmailUsecase: SendVerificationEmailUseCase,
    private readonly verificationService: VerificationService,
    private readonly tokenService: AuthTokenService,
  ) {}

  async execute(dto: RegisterDto): Promise<void> {
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
    });

    // Generate verification token
    const verificationToken = this.tokenService.generateVerificationToken({
      id: user.id,
      email: user.email,
    });

    // Send verification email asynchronously
    await this.sendVerificationEmail(dto.email, verificationToken);
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

  private async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
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

      console.log(`Verification token for ${email}: ${token}`);
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
