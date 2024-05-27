import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../entities/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RoleGuard ensures access to routes based on the user's role.
 * Grants access if the user has the required role or if the user
 * is a regular user trying to perform an action on their own ID
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Retrieve the roles required to access the route
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are defined for the route, grant access
    if (!requiredRoles) return true;

    const { user, params } = context.switchToHttp().getRequest();
    const userRole = user.role as Role;

    // Additional check: grant access if the user is a regular user
    // and their ID matches the ID in the route parameters
    if (userRole === Role.USER && user.id === params.id) return true;

    // Check if the user has the required role
    const hasRole = requiredRoles.includes(userRole);

    // Grant access if the user has the required role
    if (hasRole) return true;

    // If none of the checks pass, deny access
    throw new ForbiddenException('You don`t have permission to perform');
  }
}
