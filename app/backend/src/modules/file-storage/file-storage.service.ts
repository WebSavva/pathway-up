import { Injectable, Inject } from '@nestjs/common';

import { S3_SERVICE_INJECTION_KEY, S3Service } from './s3.service';

@Injectable()
export class FileStorageService {
  @Inject(S3_SERVICE_INJECTION_KEY)
  s3Service: S3Service;

}
