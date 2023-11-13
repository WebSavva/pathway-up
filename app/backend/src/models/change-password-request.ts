import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Relation,
} from 'typeorm';

import { User } from './user.model';

@Entity()
export class ChangePasswordRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  confirmedAt: Date | null;

  @ManyToOne((type) => User, (user) => user.emails)
  user: Relation<User>;

  @Column({
    type: 'varchar',
  })
  confirmationHash: string;

  @Column({
    type: 'varchar',
  })
  oldPasswordHash: string

  @Column({
    type: 'varchar',
  })
  newPasswordHash: string
}
