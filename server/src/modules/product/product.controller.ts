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
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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

  @Post()
  async createProduct(@Body() dto: CreateProductDto, @Req() req: Request) {
    const { id } = req.user as any;

    try {
      return await this.productService.createProduct(id, dto);
    } catch (err) {
      throw new BadRequestException('Failed to create product');
    }
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: CreateProductDto,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user as any;
    try {
      return await this.productService.updateProduct(userId, id, dto);
    } catch (err) {
      throw new BadRequestException('Failed to update product');
    }
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string, @Req() req: Request) {
    const { id: userId } = req.user as any;

    try {
      await this.productService.deleteProduct(id, userId);
      return { message: 'Product deleted successfully' };
    } catch (err) {
      throw new BadRequestException('Failed to delete product');
    }
  }
}
