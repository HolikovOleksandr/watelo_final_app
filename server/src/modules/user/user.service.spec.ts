import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from './entities/role.enum';
import { DatabaseModule } from '../database/database.module';
import * as bcrypt from 'bcrypt';
import { IJwtPayload } from '../auth/interfases/jwt-payload.interface';
import configuration from 'src/config/env/configuration';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    password: 'password',
    phone: '+389083891543',
    name: 'John',
    surname: 'Doe',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        DatabaseModule,
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  beforeEach(async () => {
    await userRepository.query('TRUNCATE TABLE "user" CASCADE');
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const hashedPassword = await bcrypt.hash(mockCreateUserDto.password, 10);
      userRepository.findOne = jest.fn().mockResolvedValueOnce(null);
      mockConfigService.get.mockReturnValueOnce(10);

      const createdUser = {
        id: '1',
        ...mockCreateUserDto,
        password: hashedPassword,
      };

      userRepository.create = jest.fn().mockReturnValueOnce(createdUser);
      userRepository.save = jest.fn().mockResolvedValueOnce(createdUser);

      const result = await userService.create(mockCreateUserDto);

      expect(result).toEqual(createdUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: expect.any(String),
      });
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);
    });

    it('should throw ConflictException if user with the same email exists', async () => {
      userRepository.findOne = jest.fn().mockResolvedValueOnce({ id: '1' });

      await expect(userService.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      userRepository.findOne = jest.fn().mockResolvedValueOnce(null);
      mockConfigService.get.mockReturnValueOnce(10);
      userRepository.create = jest.fn().mockReturnValueOnce(mockCreateUserDto);
      userRepository.save = jest
        .fn()
        .mockRejectedValueOnce(new Error('Unexpected Error'));

      await expect(userService.create(mockCreateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: '1', email: 'test1@example.com' },
        { id: '2', email: 'test2@example.com' },
      ];
      userRepository.find = jest.fn().mockResolvedValueOnce(users);

      const result = await userService.findAllUsers();

      expect(result).toEqual(users);
    });
  });

  describe('findUserById', () => {
    it('should return the user if found', async () => {
      const userId = '1';
      const user = { id: userId, email: 'test@example.com' };
      userRepository.findOne = jest.fn().mockResolvedValueOnce(user);

      const result = await userService.findUserById(userId);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = '1';
      userRepository.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(userService.findUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return the user if found', async () => {
      const email = 'test@example.com';
      const user = { id: '1', email };
      userRepository.findOne = jest.fn().mockResolvedValueOnce(user);

      const result = await userService.findUserByEmail(email);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const email = 'test@example.com';
      userRepository.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(userService.findUserByEmail(email)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    const updateUserDto: UpdateUserDto = {
      email: 'updated@example.com',
      password: 'newpassword',
      phone: '+389083891543',
      name: 'Updated',
      surname: 'User',
    };

    const mockJwtPayload: IJwtPayload = {
      id: '1',
      email: 'test@example.com',
      role: Role.ADMIN,
    };

    it('should update the user', async () => {
      const userId = '1';
      const user = { id: userId, ...mockCreateUserDto };
      userRepository.findOne = jest.fn().mockResolvedValueOnce(user);
      userRepository.save = jest.fn().mockResolvedValueOnce({
        id: userId,
        ...updateUserDto,
      });

      const result = await userService.updateUser(
        userId,
        updateUserDto,
        mockJwtPayload,
      );

      expect(result).toEqual({ id: userId, ...updateUserDto });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        ...updateUserDto,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = '1';
      userRepository.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(
        userService.updateUser(userId, updateUserDto, mockJwtPayload),
      ).rejects.toThrow(NotFoundException);
    });

    // it("should throw BadRequestException if user tries to change own user's role", async () => {
    //   const createUserDto = {
    //     id: 1,
    //     email: 'test@example.com',
    //     password: 'password',
    //     phone: '+389083891543',
    //     name: 'John',
    //     surname: 'Doe',
    //     role: Role.USER,
    //   };

    //   const createdUser: User = await userService.create(createUserDto);

    //   const updateUserDto: UpdateUserDto = {
    //     role: Role.ADMIN,
    //   };

    //   const mockJwtPayload: IJwtPayload = {
    //     id: createdUser.id.toString(),
    //     email: createdUser.email,
    //     role: Role.USER,
    //   };

    //   await expect(
    //     userService.updateUser(createdUser.id, updateUserDto, mockJwtPayload),
    //   ).rejects.toThrow(BadRequestException);

    //   // Verify that the user's role has not been changed
    //   const updatedUser = await userRepository.findOne({
    //     where: { id: createdUser.id },
    //   });
    //   expect(updatedUser.role).toEqual(Role.USER);
    // });
  });

  describe('removeUser', () => {
    it('should throw NotFoundException if user is not found', async () => {
      const userId = '1';
      userRepository.findOne = jest.fn().mockResolvedValueOnce(null);

      await expect(userService.removeUser(userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if delete fails', async () => {
      const userId = '1';
      const user = { id: userId, ...mockCreateUserDto };
      userRepository.findOne = jest.fn().mockResolvedValueOnce(user);
      userRepository.remove = jest
        .fn()
        .mockRejectedValueOnce(new Error('Unexpected Error'));

      await expect(userService.removeUser(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
