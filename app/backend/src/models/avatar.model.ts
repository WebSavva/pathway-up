import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Relation,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { UpdateableEntity } from './abstract/updateable-entity';
import { User } from './user.model';

@Entity()
export class Avatar extends UpdateableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @OneToOne((type) => User, (user) => user.avatar, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  user?: Relation<User> | null;

  @Column({
    type: 'varchar',
    length: '300',
  })
  key: string;

  get url() {
    return `${process.env.PW_S3_URL}/${process.env.PW_S3_BUCKET}/${this.key}`;
  }
}
