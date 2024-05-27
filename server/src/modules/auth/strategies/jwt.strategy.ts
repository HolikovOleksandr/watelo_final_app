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
      // Extract JWT from the Authorization header as a Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Retrieve the JWT secret from the configuration
      secretOrKey: configService.get<string>('jwt.secret'),

      // Do not ignore the token expiration
      ignoreExpiration: false,
    });
  }

  /**
   * Validate the JWT payload.
   * @param payload - The JWT payload containing user information.
   * @returns A Promise of the User entity if validation is successful.
   * @throws UnauthorizedException if the user is not found or validation fails.
   */
  async validate(payload: JwtPayload): Promise<User> {
    try {
      // Find the user by ID from the payload
      const user = await this.userService.findUserById(payload.id);

      // Throw an exception if the user is not found
      if (!user) throw new UnauthorizedException();

      // Return the user if found and validated
      return user;
    } catch (err) {
      // Throw an UnauthorizedException if there is an error during validation
      throw new UnauthorizedException('Unauthorized', err.message);
    }
  }
}
