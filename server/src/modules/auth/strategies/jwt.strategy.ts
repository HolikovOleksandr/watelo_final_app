import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/entities/user.entity';
import { JwtPayload } from '../interfases/jwt-payload.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.secret'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    console.log(':::::: JwtStrategy ::::::');
    console.log(JSON.stringify(payload));

    try {
      const user = await this.userService.findUserById(payload.sub);
      if (!user) throw new UnauthorizedException();
      return user;
    } catch (err) {
      throw new UnauthorizedException('Unauthorized', err.message);
    }
  }
}
