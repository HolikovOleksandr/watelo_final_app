import { Injectable } from '@nestjs/common';
import { IJwtPayload } from 'src/modules/auth/interfases/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ProductService } from '../product.service';
import { RoleGuard } from 'src/modules/app/guards/role.guard';

/**
 * ProductRoleGuard ensures access to product routes based on the user's role.
 * Grants access if the user has the required role or if the user
 * is a regular user trying to perform an action on their own ID
 */
@Injectable()
export class ProductRoleGuard extends RoleGuard {
  constructor(
    reflector: Reflector,
    jwtService: JwtService,
    private productService: ProductService,
  ) {
    super(reflector, jwtService);
  }

  protected async isChangeble(payload: IJwtPayload, request: any) {
    const product = await this.productService.getProductById(request.params.id);
    return payload.id == product.creator.id;
  }
}
