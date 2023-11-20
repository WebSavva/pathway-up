import { Global, Module } from '@nestjs/common';

import { SerializerService } from './serializer.service';

@Global()
@Module({
  providers: [SerializerService],
  exports: [SerializerService],
})
export class SerializerModule {}
