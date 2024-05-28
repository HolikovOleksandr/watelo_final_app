import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Creates a new product.
   * @param dto - The data transfer object containing product details.
   * @param creator - The user who creates the product.
   * @returns The created product.
   * @throws BadRequestException if product creation fails.
   */
  async createProduct(dto: CreateProductDto, creator: User): Promise<Product> {
    // Create a new product entity with the provided DTO and creator
    const product = this.productRepository.create({ ...dto, creator });

    try {
      // Save the product entity to the database
      return await this.productRepository.save(product);
    } catch (err) {
      // Throw a BadRequestException if product creation fails
      throw new BadRequestException('Failed to create product');
    }
  }

  /**
   * Updates an existing product by ID.
   * @param id - The ID of the product to update.
   * @param dto - The data transfer object containing updated product details.
   * @returns The updated product.
   * @throws NotFoundException if the product with the provided ID is not found.
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    // Find the product by its ID along with its creator relation
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    // Throw a NotFoundException if the product is not found
    if (!product) throw new NotFoundException('Product not found');

    // Update the product properties with the provided DTO
    product.title = dto.title;
    product.description = dto.description;
    product.price = dto.price;

    // Save the updated product entity to the database
    return this.productRepository.save(product);
  }

  /**
   * Deletes a product by ID.
   * @param productId - The ID of the product to delete.
   * @throws NotFoundException if the product with the provided ID is not found.
   */
  async deleteProduct(productId: string): Promise<void> {
    // Find the product by its ID along with its creator relation
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['creator'],
    });

    // Throw a NotFoundException if the product is not found
    if (!product) throw new NotFoundException('Product not found');

    // Delete the product from the database
    await this.productRepository.delete(product);
  }

  /**
   * Retrieves all products.
   * @returns A list of all products.
   */
  async getAllProducts(): Promise<Product[]> {
    // Retrieve all products from the database
    return this.productRepository.find();
  }

  /**
   * Retrieves a product by ID.
   * @param id - The ID of the product to retrieve.
   * @returns The product with the provided ID.
   * @throws NotFoundException if the product with the provided ID is not found.
   */
  async getProductById(id: string): Promise<Product> {
    // Find the product by its ID along with its creator relation
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    // Throw a NotFoundException if the product is not found
    if (!product) throw new NotFoundException('Product not found');

    // Return the found product entity
    return product;
  }
}
