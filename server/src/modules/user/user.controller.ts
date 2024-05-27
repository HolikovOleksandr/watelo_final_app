import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from './guards/role.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './entities/role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.userService.findAllUsers();
    } catch (error) {
      throw new NotFoundException('Users not found');
    }
  }

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

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.updateUser(id, updateUserDto);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  async remove(@Param('id') id: string) {
    try {
      await this.userService.removeUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  @Delete()
  @UseGuards(RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async removeAll() {
    try {
      await this.userService.removeAllUsers();
      return { message: 'All users deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete users');
    }
  }
}
