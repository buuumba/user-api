import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Avatar } from '../../avatars/entities/avatars.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'citext',
    unique: true,
  })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  age: number;

  @Column({ length: 1000 })
  bio: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => Avatar, (avatar) => avatar.user)
  avatars: Avatar[];
}
