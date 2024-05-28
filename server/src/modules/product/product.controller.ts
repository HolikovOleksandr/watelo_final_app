import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  NotFoundException,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Request } from 'express';
import { Role } from '../user/entities/role.enum';
import { ProductRoleGuard } from './guards/product-role.guard';
import { Roles } from '../app/decorators/roles.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async createProduct(@Body() dto: CreateProductDto, @Req() req: Request) {
    const authHeader = req.headers.authorization;
    const payload = this.authService.validateToken(authHeader);
    const creator = await this.userService.findUserById(payload.id);

    try {
      return await this.productService.createProduct(dto, creator);
    } catch (err) {
      throw new BadRequestException('Failed to create product');
    }
  }

  @Get()
  async getAllProducts() {
    try {
      return await this.productService.getAllProducts();
    } catch (err) {
      throw new NotFoundException('Products not found');
    }
  }

  @Get(':id')
  async getProductById(@Param('id') id: string) {
    try {
      return await this.productService.getProductById(id);
    } catch (err) {
      throw new NotFoundException('Product not found');
    }
  }

  @Patch(':id')
  @UseGuards(ProductRoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      return await this.productService.updateProduct(id, dto);
    } catch (err) {
      throw new BadRequestException('Failed to update product');
    }
  }

  @Delete(':id')
  @UseGuards(ProductRoleGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  async deleteProduct(@Param('id') id: string) {
    try {
      await this.productService.deleteProduct(id);
      return { message: 'Product deleted successfully' };
    } catch (err) {
      throw new BadRequestException('Failed to delete product');
    }
  }
}
