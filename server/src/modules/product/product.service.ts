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

  async createProduct(dto: CreateProductDto, creator: User): Promise<Product> {
    const product = this.productRepository.create({ ...dto, creator });

    try {
      return await this.productRepository.save(product);
    } catch (err) {
      throw new BadRequestException('Failed to create product');
    }
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!product) throw new NotFoundException('Product not found');

    product.title = dto.title;
    product.description = dto.description;
    product.price = dto.price;

    return this.productRepository.save(product);
  }

  async deleteProduct(productId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['creator'],
    });

    await this.productRepository.delete(product);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
