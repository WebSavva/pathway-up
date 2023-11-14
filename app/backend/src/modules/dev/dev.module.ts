import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';

import { DevController } from './dev.controller';
import { ModuleRef } from '@nestjs/core';

@Module({
  controllers: [DevController],
})
export class DevModule {}
