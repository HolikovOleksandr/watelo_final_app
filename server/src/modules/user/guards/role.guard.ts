import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../entities/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from 'src/modules/auth/interfases/jwt-payload.interface';

/**
 * RoleGuard ensures access to routes based on the user's role.
 * Grants access if the user has the required role or if the user
 * is a regular user trying to perform an action on their own ID
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
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

    // Extract the JWT token from the Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Unauthorized');
    }

    const token = authHeader.split(' ')[1];

    // Verify and decode the JWT token
    let payload: IJwtPayload;

    try {
      payload = this.jwtService.verify(token);
    } catch (err) {
      throw new ForbiddenException('Unauthorized');
    }

    // Check if the user is a regular user and matches the ID in the route params
    const isSelfId = payload.id == request.params.id;
    const isUser = payload.role == Role.USER;
    if (isUser && !isSelfId) return false;

    // Check if the user has the required role
    const hasRole = requiredRoles.includes(payload.role);
    if (hasRole) return true;

    // If none of the checks pass, deny access
    throw new ForbiddenException('You haven`t permission to this action');
  }
}
