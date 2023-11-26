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

  @Column({
    type: 'enum',
    enum: FILES,
  })
  type: FILES;

  @Exclude()
  @OneToOne((type) => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user?: Relation<User>;

  @Column({
    type: 'string',
    length: '300',
  })
  key: string;
}
