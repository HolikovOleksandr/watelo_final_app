import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Method to determine if the request can proceed based on JWT authentication.
   * @param context - The execution context of the request.
   * @returns A boolean indicating whether the request can proceed.
   * @throws UnauthorizedException if the JWT is missing or invalid.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract the request object from the execution context.
    const request: Request = context.switchToHttp().getRequest();

    // Retrieve the JWT secret from the configuration service.
    const secret = this.configService.get<string>('jwt.secret');

    // Extract the JWT token from the Authorization header.
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    try {
      // Verify the token using the JWT service and secret.
      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Attach the decoded payload to the request object for further use.
      request['user'] = payload;
    } catch {
      // Throw an exception if the token verification fails.
      throw new UnauthorizedException();
    }

    // Allow the request to proceed if the token is valid.
    return true;
  }

  /**
   * Helper method to extract the JWT token from the Authorization header.
   * @param req - The request object.
   * @returns The extracted token or undefined if the format is incorrect.
   */
  private extractTokenFromHeader(@Req() req: Request): string | undefined {
    // Split the Authorization header into type and token parts.
    const [type, token] = req.headers.authorization?.split(' ') ?? [];

    // Return the token if the type is 'Bearer', otherwise return undefined.
    return type === 'Bearer' ? token : undefined;
  }
}
