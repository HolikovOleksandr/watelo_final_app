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

@ApiTags('atuh')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(@Req() req: Request): Promise<{}> {
    return this.authService.signIn(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<any> {
    try {
      return await this.authService.signUp(createUserDto);
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
