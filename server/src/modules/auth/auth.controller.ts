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

@ApiTags('atuh')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  async login(@Req() req: Request): Promise<{}> {
    try {
      return this.authService.signIn(req.user as User);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto): Promise<{}> {
    try {
      return await this.authService.signUp(dto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
