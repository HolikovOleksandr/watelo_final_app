import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtPayload } from './interfases/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(email: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid email');

    const validPass = await bcrypt.compare(pass, user.password);
    if (!validPass) throw new UnauthorizedException('Invalid password');

    const { password, ...result } = user;
    return result;
  }

  async signIn(user: any): Promise<{}> {
    const payload: JwtPayload = {
      email: user.email,
      role: user.role,
      id: user.id,
    };

    return { payload, access_token: this.jwtService.sign(payload) };
  }

  async signUp(dto: CreateUserDto): Promise<{}> {
    try {
      const createdUser = await this.userService.create(dto);
      const { password, ...result } = createdUser;
      return result;
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }
}
