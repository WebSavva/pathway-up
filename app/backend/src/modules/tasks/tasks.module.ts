import { Module } from '@nestjs/common';

import { UsersModule } from '@/modules/users/users.module';
import { FileStorageModule } from '@/modules/file-storage/file-storage.module';

import { TasksService } from './tasks.service';

@Module({
  imports: [UsersModule, FileStorageModule],
  providers: [TasksService],
})
export class TasksModule {}
