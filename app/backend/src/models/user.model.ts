import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
} from 'typeorm';
import { Exclude ,Expose } from 'class-transformer';

import { GENDERS, COUNTRIES, ROLES, GROUPS } from '../constants';

import { Email } from './email.model';
import { PasswordChangeRequest } from './password-change-request.model';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
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

  @Exclude()
  @Column({
    type: 'varchar',
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  bio?: string | null;

  @Column({
    type: 'enum',
    default: GENDERS.Neutral,
    enum: GENDERS,
  })
  gender: GENDERS;

  @Column({
    type: 'enum',
    nullable: true,
    enum: COUNTRIES,
  })
  countryCode?: COUNTRIES | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  isBlocked: boolean;

  @Column({
    type: 'enum',
    enum: ROLES,
    default: ROLES.User,
  })
  role: ROLES;

  @Exclude()
  @Column({
    type: 'varchar',
    unique: true,
  })
  confirmationHash: string;

  @Exclude()
  @OneToMany((type) => Email, (email) => email.user, {
    onDelete: 'CASCADE',
  })
  emails: Relation<Email>[];

  @Exclude()
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

  @Expose({
    groups: [GROUPS.Admin, GROUPS.Self]
  })
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  confirmedAt: Date | null;

  @Expose({
    groups: [GROUPS.Admin, GROUPS.Self]
  })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @BeforeUpdate()
  updateUpdatedAt() {
    this.updatedAt = new Date();
  }
}
