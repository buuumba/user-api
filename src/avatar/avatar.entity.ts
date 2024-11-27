import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  DeleteDateColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "../user/user.entity";

@Entity("avatars")
export class Avatar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string; // Имя файла

  @Column({ default: true })
  isActive: boolean; // Статус активности

  @ManyToOne(() => User, (user) => user.avatars, { onDelete: "CASCADE" })
  user: User; // Связь с пользователем

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date; // Soft delete
}
