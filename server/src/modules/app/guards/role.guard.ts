import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/modules/user/entities/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IJwtPayload } from 'src/modules/auth/interfases/jwt-payload.interface';

@Injectable()
export abstract class RoleGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    protected jwtService: JwtService,
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

    const isUser = payload.role == Role.USER;
    const canChange = this.isChangeble(payload, request);
    if (isUser && !canChange) return false;

    // Check if the user has the required role
    const hasRole = requiredRoles.includes(payload.role);
    if (hasRole) return true;

    // If none of the checks pass, deny access
    throw new ForbiddenException('You haven`t permission to this action');
  }

  protected abstract isChangeble(
    payload: IJwtPayload,
    request: any,
  ): Promise<boolean> | boolean;
}
