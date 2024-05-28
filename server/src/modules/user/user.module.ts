import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product])],
  controllers: [UserController],
  providers: [UserService, AuthService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
