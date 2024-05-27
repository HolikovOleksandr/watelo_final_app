import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'double precision' })
  price: number;

  @ManyToOne(() => User, (user) => user.products, {
    cascade: true,
    // onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'creatorId' })
  creator: User;
}
