import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from './guards/role.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './entities/role.enum';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Endpoint to create a new user.
   * Only accessible to SUPERADMIN and ADMIN roles.
   * @param dto - The CreateUserDto object containing user data.
   * @returns A Promise<User> representing the newly created user.
   * @throws BadRequestException if failed to create user.
   */
  @Post()
  @UseGuards(RoleGuard) // Protecting route with RoleGuard
  @Roles(Role.SUPERADMIN, Role.ADMIN) // Allowing only SUPERADMIN and ADMIN roles
  async createUser(@Body() dto: CreateUserDto) {
    try {
      const user = dto as User;
      user.role = Role.USER; // Setting role to USER for new user creation

      return await this.userService.create(user);
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  /**
   * Endpoint to create a new admin.
   * Only accessible to SUPERADMIN role.
   * @param dto - The CreateUserDto object containing admin data.
   * @returns A Promise<User> representing the newly created admin.
   * @throws BadRequestException if failed to create admin.
   */
  @Post('admin')
  @UseGuards(RoleGuard) // Protecting route with RoleGuard
  @Roles(Role.SUPERADMIN) // Allowing only SUPERADMIN role
  async createAdmin(@Body() dto: CreateUserDto) {
    try {
      const admin = dto as User;
      admin.role = Role.ADMIN; // Setting role to ADMIN for new admin creation

      return await this.userService.create(admin);
    } catch (error) {
      throw new BadRequestException('Failed to create admin');
    }
  }

  /**
   * Endpoint to retrieve all users.
   * @returns A Promise<User[]> representing all users.
   * @throws NotFoundException if users are not found.
   */
  @Get()
  async findAll() {
    try {
      return await this.userService.findAllUsers();
    } catch (error) {
      throw new NotFoundException('Users not found');
    }
  }

  /**
   * Endpoint to retrieve a user by ID.
   * @param id - The ID of the user to retrieve.
   * @returns A Promise<User> representing the found user.
   * @throws NotFoundException if user with the provided ID is not found.
   * @throws BadRequestException if failed to find user.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.userService.findUserById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new BadRequestException('Failed to find user');
      }
    }
  }

  /**
   * Endpoint to update a user by ID.
   * Only accessible to SUPERADMIN, ADMIN, and USER roles.
   * @param id - The ID of the user to update.
   * @param updateUserDto - The UpdateUserDto object containing updated user data.
   * @returns A Promise<User> representing the updated user.
   * @throws BadRequestException if failed to update user.
   */
  @Patch(':id')
  @UseGuards(RoleGuard) // Protecting route with RoleGuard
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER) // Allowing SUPERADMIN, ADMIN, and USER roles
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.updateUser(id, updateUserDto);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  /**
   * Endpoint to remove a user by ID.
   * Only accessible to SUPERADMIN, ADMIN, and USER roles.
   * @param id - The ID of the user to remove.
   * @returns A success message object if user is deleted successfully.
   * @throws BadRequestException if failed to delete user.
   */
  @Delete(':id')
  @UseGuards(RoleGuard) // Protecting route with RoleGuard
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER) // Allowing SUPERADMIN, ADMIN, and USER roles
  async remove(@Param('id') id: string) {
    try {
      await this.userService.removeUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  /**
   * Endpoint to remove all users except admins (SUPERADMIN and ADMIN).
   * Only accessible to SUPERADMIN and ADMIN roles.
   * @returns A success message object if users are deleted successfully.
   * @throws BadRequestException if failed to delete users.
   */
  @Delete('all')
  @UseGuards(RoleGuard) // Protecting route with RoleGuard
  @Roles(Role.SUPERADMIN, Role.ADMIN) // Allowing only SUPERADMIN and ADMIN roles
  async removeAll() {
    try {
      await this.userService.removeAllUsers();
      return { message: 'All users deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete users');
    }
  }
}
