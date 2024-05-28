import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Role } from './entities/role.enum';
import { IJwtPayload } from '../auth/interfases/jwt-payload.interface';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new user.
   * @param dto - The CreateUserDto object containing user data.
   * @returns A Promise<User> representing the newly created user.
   * @throws ConflictException if the email already exists.
   * @throws InternalServerErrorException if failed to create user.
   */
  async create(dto: CreateUserDto): Promise<User> {
    const { email, password } = dto;

    // Check if user with the same email already exists
    const existUser = await this.userRepository.findOne({ where: { email } });
    if (existUser) throw new ConflictException('This email already exists');

    // Generate hashed password
    const hashSalt = +this.configService.get<number>('hash.salt');
    const hash = await bcrypt.hash(password, hashSalt);

    // Create a new user object
    const newUser = this.userRepository.create({ ...dto, password: hash });

    try {
      // Save and return the newly created user
      return await this.userRepository.save(newUser);
    } catch (error) {
      // Throw an internal server error if save fails
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Retrieve all users.
   * @returns A Promise<User[]> representing all users.
   */
  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  /**
   * Find a user and her products by ID.
   * @param id - The ID of the user to find.
   * @returns A Promise<User> representing the found user.
   * @throws NotFoundException if user with the provided ID is not found.
   */
  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    // Throw NotFoundException if user is not found
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  /**
   * Find a user by email.
   * @param email - The email of the user to find.
   * @returns A Promise<User> representing the found user.
   * @throws NotFoundException if user with the provided email is not found.
   */
  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Update a user by ID.
   * @param id - The ID of the user to update.
   * @param dto - The UpdateUserDto object containing updated user data.
   * @param requesterId - The ID of the user making the request.
   * @returns A Promise<User> representing the updated user.
   * @throws NotFoundException if user with the provided ID is not found.
   * @throws InternalServerErrorException if failed to update user.
   */
  async updateUser(
    id: string,
    dto: UpdateUserDto,
    payload: IJwtPayload,
  ): Promise<User> {
    // Find the user by ID
    const user = await this.userRepository.findOne({ where: { id } });

    // Throw NotFoundException if user is not found
    if (!user) throw new NotFoundException('User not found');

    // Check if the requester is trying to change another user's role
    if (payload.role === Role.USER && dto.role !== Role.USER) {
      throw new BadRequestException('You are not allowed to change the role');
    }

    try {
      // Update user entity with new data from dto
      const updatedUser = await this.userRepository.save({
        ...user,
        ...dto,
      });

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Remove a user by ID.
   * @param id - The ID of the user to remove.
   * @returns A Promise<void> representing the operation completion.
   * @throws NotFoundException if user with the provided ID is not found.
   * @throws InternalServerErrorException if failed to delete user.
   */
  async removeUser(id: string): Promise<void> {
    // Find the user by ID
    const user = await this.userRepository.findOne({ where: { id } });

    // Throw NotFoundException if user is not found
    if (!user) throw new NotFoundException('User not found');

    try {
      // Remove user from database
      await this.userRepository.remove(user);
    } catch (error) {
      // Throw an internal server error if delete fails
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
