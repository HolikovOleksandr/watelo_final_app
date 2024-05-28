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

  /**
   * Endpoint to create a new product.
   * @param dto - The data transfer object containing product details.
   * @param req - The request object containing the authorization header.
   * @returns The created product.
   * @throws BadRequestException if product creation fails.
   */
  @Post()
  async createProduct(@Body() dto: CreateProductDto, @Req() req: Request) {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;

    // Validate the JWT token
    const payload = this.authService.validateToken(authHeader);

    // Find the user by ID from the token payload
    const creator = await this.userService.findUserById(payload.id);
    try {
      // Create the product using the provided DTO and creator information
      return await this.productService.createProduct(dto, creator);
    } catch (err) {
      // Throw an error if product creation fails
      throw new BadRequestException('Failed to create product');
    }
  }

  /**
   * Endpoint to get all products.
   * @returns A list of all products.
   * @throws NotFoundException if no products are found.
   */
  @Get()
  async getAllProducts() {
    try {
      // Retrieve all products
      return await this.productService.getAllProducts();
    } catch (err) {
      // Throw an error if products are not found
      throw new NotFoundException('Products not found');
    }
  }

  /**
   * Endpoint to get a product by its ID.
   * @param id - The ID of the product to retrieve.
   * @returns The product with the provided ID.
   * @throws NotFoundException if the product with the provided ID is not found.
   */
  @Get(':id')
  async getProductById(@Param('id') id: string) {
    try {
      // Retrieve the product by its ID
      return await this.productService.getProductById(id);
    } catch (err) {
      // Throw an error if the product is not found
      throw new NotFoundException('Product not found');
    }
  }

  /**
   * Endpoint to update a product by its ID.
   * @param id - The ID of the product to update.
   * @param dto - The data transfer object containing updated product details.
   * @returns The updated product.
   * @throws BadRequestException if product update fails.
   */
  @Patch(':id')
  @UseGuards(ProductRoleGuard) // Apply guard to check for appropriate role
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER) // Restrict access to users with specific roles
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      // Update the product using the provided DTO
      return await this.productService.updateProduct(id, dto);
    } catch (err) {
      // Throw an error if product update fails
      throw new BadRequestException('Failed to update product');
    }
  }

  /**
   * Endpoint to delete a product by its ID.
   * @param id - The ID of the product to delete.
   * @returns A success message if the product is deleted.
   * @throws BadRequestException if product deletion fails.
   */
  @Delete(':id')
  @UseGuards(ProductRoleGuard) // Apply guard to check for appropriate role
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER) // Restrict access to users with specific roles
  async deleteProduct(@Param('id') id: string) {
    try {
      // Delete the product by its ID
      await this.productService.deleteProduct(id);

      // Return a success message
      return { message: 'Product deleted successfully' };
    } catch (err) {
      // Throw an error if product deletion fails
      throw new BadRequestException('Failed to delete product');
    }
  }
}
