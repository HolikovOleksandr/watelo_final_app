import { Injectable } from '@nestjs/common';
import { IJwtPayload } from 'src/modules/auth/interfases/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { RoleGuard } from 'src/modules/app/guards/role.guard';

/**
 * UserRoleGuard ensures access to routes based on the user's role.
 * Grants access if the user has the required role or if the user
 * is a regular user trying to perform an action on their own ID
 */
@Injectable()
export class UserRoleGuard extends RoleGuard {
  constructor(reflector: Reflector, jwtService: JwtService) {
    super(reflector, jwtService);
  }

  protected isChangeble(payload: IJwtPayload, request: any): boolean {
    return payload.id == request.params.id;
  }
}
