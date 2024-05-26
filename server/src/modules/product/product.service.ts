import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { User } from '../user/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Role } from '../user/entities/user-role.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createProduct(userId: string, dto: CreateProductDto): Promise<Product> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const product = new Product();
    product.title = dto.title;
    product.description = dto.description;
    product.price = dto.price;
    product.creator = user;

    return this.productRepository.save(product);
  }

  async updateProduct(
    userId: string,
    productId: string,
    dto: CreateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['creator'],
    });

    if (!product) throw new NotFoundException('Product not found');

    if (
      !(
        product.creator.id === userId ||
        product.creator.role === Role.ADMIN ||
        product.creator.role === Role.SUPERADMIN
      )
    ) {
      throw new UnauthorizedException(
        'You are not authorized to delete this product',
      );
    }

    product.title = dto.title;
    product.description = dto.description;
    product.price = dto.price;

    return this.productRepository.save(product);
  }

  async deleteProduct(productId: string, userId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['creator'],
    });

    if (!product) throw new NotFoundException('Product not found');

    if (
      !(
        product.creator.id === userId ||
        product.creator.role === Role.ADMIN ||
        product.creator.role === Role.SUPERADMIN
      )
    ) {
      throw new UnauthorizedException(
        'You are not authorized to delete this product',
      );
    }

    await this.productRepository.delete(productId);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
