import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Relation,
  OneToOne,
} from 'typeorm';
import { FILES } from '@pathway-up/constants';
import { Exclude } from 'class-transformer';

import { UpdateableEntity } from './abstract/updateable-entity';
import { User } from './user.model';

@Entity()
export class Avatar extends UpdateableEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @OneToOne((type) => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user?: Relation<User>;

  @Column({
    type: 'varchar',
    length: '300',
  })
  key: string;

  get url() {
    return `${process.env.PW_S3_URL}/${process.env.PW_S3_BUCKET}/${this.key}`;
  }
}
