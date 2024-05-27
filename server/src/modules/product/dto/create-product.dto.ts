import { IsNotEmpty, IsString, Min, IsNumber } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0.1, { message: 'Price must be a positive value' })
  price: number;
}
