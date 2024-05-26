import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Role } from './user-role.enum';
import { Product } from 'src/modules/product/entities/product.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  surname?: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.SUPERADMIN,
  })
  role: Role;

  @Column()
  password: string;

  @OneToMany(() => Product, (product) => product.creator)
  products: Product[];
}
