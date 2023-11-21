import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Relation
} from 'typeorm';
import { EMAIL_TYPES } from '@pathway-up/constants';

import { User } from './user.model';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EMAIL_TYPES,
  })
  type: EMAIL_TYPES;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sentAt: Date;

  @ManyToOne((type) => User, (user) => user.emails)
  user: Relation<User>;
}
