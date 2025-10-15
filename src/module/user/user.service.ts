import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { BcryptService } from 'common/helpers/bcrypt.util';
import { PrismaService } from 'app/infra/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Service for handling user-related operations
 */
@Injectable()
export class UsersService {
  /**
   * Initialize service with PrismaService and BcryptService
   */
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  /**
   * Find user by email
   * @param email - User's email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username
   * @param username - User's username
   * @returns User or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { username },
    });
  }

  /**
   * Find user by email or username
   * @param identifier - Email or username
   * @returns User or null if not found
   */
  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  /**
   * Find user by ID
   * @param id - User's ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new user
   * @param dto - User creation data
   * @returns Created user
   */
  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);
    return this.prismaService.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  /**
   * Update user information
   * @param id - User's ID
   * @param dto - Update data
   * @returns Updated user
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    if (dto.password) {
      dto.password = await this.bcryptService.hashPassword(dto.password);
    }
    return this.prismaService.user.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Get all users
   * @returns List of users
   */
  async findAll(): Promise<User[]> {
    return this.prismaService.user.findMany();
  }

  /**
   * Delete user by ID
   * @param id - User's ID
   * @returns Deleted user
   */
  async delete(id: string): Promise<User> {
    return this.prismaService.user.delete({
      where: { id },
    });
  }
}
