import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, phone, name, surname, password } = createUserDto;

    const existUser = await this.userRepository.findOne({ where: { email } });
    if (existUser) throw new ConflictException('This email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      phone,
      name,
      surname,
      password: hashedPassword,
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);

    try {
      const updatedUser = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });

      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async removeUser(id: string): Promise<void> {
    const user = await this.findUserById(id);

    try {
      await this.userRepository.remove(user);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async removeAllUsers(): Promise<void> {
    const allUsers = await this.findAllUsers();

    try {
      await this.userRepository.remove(allUsers);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
