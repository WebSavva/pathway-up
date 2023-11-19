import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
  CreateDateColumn,
} from 'typeorm';

import { GENDERS, COUNTRY, ROLES } from '../constants';

import { UpdateableEntity } from './abstract/updateable-entity';

import { Email } from './email.model';
import { PasswordChangeRequest } from './password-change-request.model';

@Entity()
export class User extends UpdateableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: '20',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthday?: Date | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatarUrl?: string | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  isConfirmed: boolean;

  @Column({
    type: 'varchar',
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: '255',
    nullable: true,
  })
  bio?: string | null;

  @Column({
    type: 'enum',
    default: GENDERS.neutral,
    enum: GENDERS,
  })
  gender: GENDERS;

  @Column({
    type: 'enum',
    nullable: true,
    enum: COUNTRY,
  })
  countryCode?: COUNTRY | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  isBlocked: boolean;

  @Column({
    type: 'enum',
    enum: ROLES,
    default: ROLES.USER,
  })
  role: ROLES;

  @Column({
    type: 'varchar',
    unique: true,
  })
  confirmationHash: string;

  @OneToMany((type) => Email, (email) => email.user, {
    onDelete: 'CASCADE',
  })
  emails: Relation<Email>[];

  @OneToMany(
    (type) => PasswordChangeRequest,
    (passwordChangeRequest) => passwordChangeRequest.user,
    {
      onDelete: 'CASCADE',
    },
  )
  passwordChangeRequests: Relation<PasswordChangeRequest>[];

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
}
