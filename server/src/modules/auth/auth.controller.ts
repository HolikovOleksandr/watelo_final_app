import {
  Controller,
  Post,
  UseGuards,
  Body,
  BadRequestException,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Request } from 'express';
import { AuthGuard } from './guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../user/guards/role.guard';
import { Roles } from '../user/decorators/roles.decorator';
import { Role } from '../user/entities/role.enum';
import { User } from '../user/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user login.
   * Uses LocalGuard to authenticate the user with email and password.
   * @param req - The request object containing user credentials.
   * @returns An object containing the JWT token and user details.
   * @throws BadRequestException if login fails.
   */
  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request): Promise<{}> {
    try {
      // Sign in the user and return the JWT token and user details
      return this.authService.signIn(req.user as User);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Handles user registration.
   * @param dto - The DTO containing user registration details.
   * @returns An object containing the registered user's details.
   * @throws BadRequestException if registration fails.
   */
  @Post('register')
  async register(@Body() dto: CreateUserDto): Promise<{}> {
    try {
      // Register the new user and return the user details
      return await this.authService.signUp(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   * Uses AuthGuard and RoleGuard to ensure the user is authenticated and authorized.
   * @param req - The request object containing user details.
   * @returns The authenticated user's profile.
   */
  @Get('profile')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  getProfile(@Req() req: Request) {
    // Return the authenticated user's profile
    return req.user;
  }
}
