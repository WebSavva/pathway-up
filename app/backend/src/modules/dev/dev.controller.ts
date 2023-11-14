import { Controller, Delete, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DevGuard } from '@/guards/dev.guard';

@Controller('/dev')
@UseGuards(DevGuard)
export class DevController {
  constructor(private dataSource: DataSource) {}

  @Delete('/database')
  async clearDatabase() {
    const entities = this.dataSource.entityMetadatas;

    const tableNames = entities
      .map((entity) => `"${entity.tableName}"`)
      .join(', ');

    await this.dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);

    return true;
  }
}
