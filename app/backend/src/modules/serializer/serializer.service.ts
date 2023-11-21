import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';

import { GROUPS } from '@pathway-up/constants';

@Injectable()
export class SerializerService {
  serializeByGroups<T>(instance: T, groups: GROUPS[] = []) {
    return instanceToPlain(instance, {
      groups,
    });
  }
}
