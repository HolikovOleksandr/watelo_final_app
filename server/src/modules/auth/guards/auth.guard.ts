import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract the request object from the execution context.
    const request: Request = context.switchToHttp().getRequest();

    try {
      // Extract the JWT token from the Authorization header and validate it.
      const token = request.headers.authorization;
      const payload = this.authService.validateToken(token);

      // Attach the decoded payload to the request object for further use.
      request['user'] = payload;
    } catch (err) {
      // Throw an exception if the token validation fails.
      throw new UnauthorizedException('Invalid token');
    }

    // Allow the request to proceed if the token is valid.
    return true;
  }
}
