import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Relation,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
  OneToOne,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import {
  GENDERS,
  COUNTRIES,
  ROLES,
  GROUPS,
  LANGUAGE_LEVELS,
  LANGUAGES,
} from '@pathway-up/constants';

import { Email } from './email.model';
import { PasswordChangeRequest } from './password-change-request.model';
import { Avatar } from './avatar.model';

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

  @OneToOne((type) => Avatar, (avatar) => avatar.user, {
    nullable: true,
    eager: true,
  })
  avatar?: Avatar | null;

  @Exclude()
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
    groups: [GROUPS.Admin, GROUPS.Self],
  })
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  confirmedAt: Date | null;

  @Expose({
    groups: [GROUPS.Admin, GROUPS.Self],
  })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: LANGUAGE_LEVELS,
    nullable: true,
  })
  englishLevel: LANGUAGE_LEVELS;

  @Column({
    type: 'enum',
    enum: LANGUAGES,
    array: true,
    default: '{}',
  })
  nativeLanguages: LANGUAGES[];

  @Column({
    type: 'varchar',
    length: 20,
    array: true,
    default: '{}',
  })
  interests: string[];

  @Exclude()
  get isAdmin() {
    return this.role === ROLES.Admin;
  }

  @BeforeUpdate()
  updateUpdatedAt() {
    this.updatedAt = new Date();
  }
}
