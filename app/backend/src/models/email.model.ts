import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Relation
} from 'typeorm';
import { EMAILS } from '@pathway-up/constants';

import { User } from './user.model';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EMAILS,
  })
  type: EMAILS;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sentAt: Date;

  @ManyToOne((type) => User, (user) => user.emails)
  user: Relation<User>;
}
