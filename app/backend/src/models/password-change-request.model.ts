import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Relation,
} from 'typeorm';

import { UpdateableEntity } from './abstract/updateable-entity';

import { User } from './user.model';

@Entity()
export class PasswordChangeRequest extends UpdateableEntity {
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

  @ManyToOne((type) => User, (user) => user.passwordChangeRequests)
  user: Relation<User>;

  @Column({
    type: 'varchar',
  })
  confirmationHash: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  oldPasswordHash?: string;

  @Column({
    type: 'varchar',
  })
  newPasswordHash: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  isConfirmed: boolean;
}
