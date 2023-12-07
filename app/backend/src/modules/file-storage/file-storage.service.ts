import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import mime from 'mime-types';

import { s3Config } from '@/configurations/s3.config';
import { CryptoService } from '@/modules/crypto/crypto.service';

import { S3_SERVICE_INJECTION_KEY, S3Service } from './s3.service';

@Injectable()
export class FileStorageService {
  @Inject(S3_SERVICE_INJECTION_KEY)
  s3Service: S3Service;

  @Inject(s3Config.KEY)
  s3Options: ConfigType<typeof s3Config>;

  constructor(private cryptoService: CryptoService) {}

  uploadFile(key: string, file: Buffer | Uint8Array | Blob | string) {
    return this.s3Service
      .upload({
        Key: key,
        Body: file,
        Bucket: this.s3Options.bucket,
      })
      .promise();
  }

  deleteFile(key: string) {
    return this.s3Service.deleteObject({
      Bucket: this.s3Options.bucket,
      Key: key,
    }).promise();
  }

  generateUniqueFilename(mimeType: string) {
    return `${this.cryptoService.generateHash(32)}.${mime.extension(mimeType)}`;
  }
}
