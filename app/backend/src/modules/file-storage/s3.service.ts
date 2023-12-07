import { S3 } from 'aws-sdk';

import { FactoryProvider } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { s3Config } from '@/configurations/s3.config';

export const S3_SERVICE_INJECTION_KEY = 's3-service';

export const S3_SERVICE_FACTORY_PROVIDER: FactoryProvider<S3> = {
  provide: S3_SERVICE_INJECTION_KEY,
  inject: [s3Config.KEY],
  useFactory: async ({
    url,
    accessKey,
    secretKey,
    bucket,
  }: ConfigType<typeof s3Config>) => {
    const s3 = new S3({
      endpoint: url,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      s3ForcePathStyle: true,
    });

    const allBuckets = await s3.listBuckets().promise();

    if (!allBuckets.Buckets.find(({ Name }) => Name === bucket)) {
      await s3
        .createBucket({
          Bucket: bucket,
          ACL: 'public-read',
        })
        .promise();
    }

    return s3;
  },
};

export type S3Service = InstanceType<typeof S3>;
