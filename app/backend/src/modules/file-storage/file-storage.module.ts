import { Module } from '@nestjs/common';

import { S3_SERVICE_FACTORY_PROVIDER } from './s3.service';
import { FileStorageService } from './file-storage.service';

@Module({
  providers: [S3_SERVICE_FACTORY_PROVIDER, FileStorageService],

  exports: [FileStorageService],
})
export class FileStorageModule {}
