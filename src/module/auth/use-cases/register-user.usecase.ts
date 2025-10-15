import { Injectable } from '@nestjs/common';
import { ConflictError } from 'common/response/client-errors/conflict';
import { PrismaService } from 'infra/prisma/prisma.service';
import { UsersService } from 'module/user/user.service';
import { EmailService } from 'module/email/email.service';
import { RegisterDto } from '../dto/register.dto';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { AuthTokenService } from '../service/auth-token.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly emailService: EmailService,
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
    this.sendVerificationEmailAsync(dto.email, verificationToken);
  }

  private async validateUserDoesNotExist(email: string, username: string): Promise<void> {
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

  private sendVerificationEmailAsync(email: string, token: string): void {
    setImmediate(async () => {
      try {
        // For now, just log the token. In real implementation, you'd send email
        console.log(`Verification token for ${email}: ${token}`);
        // await this.emailService.sendVerificationEmail(email, token);
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
    });
  }
}
