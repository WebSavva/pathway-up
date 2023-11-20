import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Relation
} from 'typeorm';

import { EMAIL_TYPE } from '../constants/email-type.constant';

import { User } from './user.model';

@Entity()
export class Email {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EMAIL_TYPE,
  })
  type: EMAIL_TYPE;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sentAt: Date;

  @ManyToOne((type) => User, (user) => user.emails)
  user: Relation<User>;
}
