import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from './user-role.enum';

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
    enum: UserRole,
    default: UserRole.SUPERADMIN,
  })
  role: UserRole;

  @Column()
  password: string;
}
