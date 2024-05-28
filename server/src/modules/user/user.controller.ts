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
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleGuard } from './guards/user-role.guard';
import { Role } from './entities/role.enum';
import { Roles } from '../app/decorators/roles.decorator';
import { AuthService } from '../auth/auth.service';
import { IJwtPayload } from '../auth/interfases/jwt-payload.interface';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Endpoint to create a new user.
   * Only accessible to SUPERADMIN and ADMIN roles.
   * @param dto - The CreateUserDto object containing user data.
   * @returns A Promise<User> representing the newly created user.
   * @throws BadRequestException if failed to create user.
   */
  @Post()
  @UseGuards(UserRoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async createUser(@Body() dto: CreateUserDto) {
    try {
      const user = await this.userService.create(dto);
      return user;
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
  @UseGuards(UserRoleGuard)
  @Roles(Role.SUPERADMIN)
  async createAdmin(@Body() dto: CreateUserDto, @Req() req: Request) {
    try {
      const user = await this.userService.create(dto);
      const updateData = { ...user, role: Role.ADMIN };

      const token = req.headers.authorization;
      const payload: IJwtPayload = this.authService.validateToken(token);

      const updatedUser = await this.userService.updateUser(
        user.id,
        updateData,
        payload,
      );

      return updatedUser;
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
   * Update a user by ID.
   * Only accessible to SUPERADMIN, ADMIN and USER for their own profile changes.
   * @param id - The ID of the user to update.
   * @param dto - The UpdateUserDto object containing updated user data.
   * @returns A Promise<User> representing the updated user.
   * @throws BadRequestException if failed to update user.
   */
  @Patch(':id')
  @UseGuards(UserRoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() request: any,
  ) {
    try {
      // Get the decoded JWT payload
      const token = request.headers.authorization;
      const payload = this.authService.validateToken(token);
      return await this.userService.updateUser(id, dto, payload);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  /**
   * Endpoint to remove a user by ID.
   * Only accessible to SUPERADMIN, ADMIN and  USER for him own profile changes.
   * @param id - The ID of the user to remove.
   * @returns A success message object if user is deleted successfully.
   * @throws BadRequestException if failed to delete user.
   */
  @Delete(':id')
  @UseGuards(UserRoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  async remove(@Param('id') id: string): Promise<{}> {
    try {
      await this.userService.removeUser(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }
}
