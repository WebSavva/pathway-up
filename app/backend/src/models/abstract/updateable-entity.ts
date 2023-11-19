import { UpdateDateColumn, BeforeUpdate } from 'typeorm';

export abstract class UpdateableEntity {
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
