import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/modules/user/entities/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IJwtPayload } from 'src/modules/auth/interfases/jwt-payload.interface';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export abstract class RoleGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    protected authService: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve the roles required to access the route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are defined for the route, grant access
    if (!requiredRoles) return true;

    // Retrieve the request
    const request = context.switchToHttp().getRequest();

    // Validate the token and get the payload
    let payload: IJwtPayload;

    try {
      const token = request.headers.authorization;
      payload = this.authService.validateToken(token);
    } catch (err) {
      throw new ForbiddenException('Unauthorized');
    }

    // Check if the user has the role USER and if they are allowed to change
    const isUser = payload.role === Role.USER;
    const canChange = this.isChangeble(payload, request);
    if (isUser && !canChange) return false;

    // Check if the user has the required role for access
    const hasRole = requiredRoles.includes(payload.role);
    if (hasRole) return true;

    // If none of the checks pass, deny access
    throw new ForbiddenException("You haven't permission to this action");
  }

  // Abstract method that must be implemented in subclasses
  protected abstract isChangeble(
    payload: IJwtPayload,
    request: any,
  ): Promise<boolean> | boolean;
}
