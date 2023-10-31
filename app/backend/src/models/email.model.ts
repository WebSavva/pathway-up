import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Relation
} from 'typeorm';

import { EmailType } from '../constants/email-type.constant';

import { User } from './user.model';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EmailType,
  })
  type: EmailType;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sentAt: Date;

  @ManyToOne((type) => User, (user) => user.emails)
  user: Relation<User>;
}
