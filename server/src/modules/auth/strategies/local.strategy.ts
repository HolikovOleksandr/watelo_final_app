import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Configure the strategy to use 'email' instead of the default 'username' field
    super({ usernameField: 'email' });
  }

  /**
   * Validate the user based on the provided email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns The authenticated user if validation is successful.
   * @throws UnauthorizedException if the validation fails.
   */
  async validate(email: string, password: string) {
    // Use the AuthService to validate the user's email and password
    return await this.authService.validateUser(email, password);
  }
}
