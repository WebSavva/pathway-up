import {
  Injectable,
  CanActivate,
  Inject,
  NotFoundException,
} from '@nestjs/common';

import { ConfigType } from '@nestjs/config';

import { modeConfig } from '@/configurations/mode.config';

@Injectable()
export class DevGuard implements CanActivate {
  constructor(
    @Inject(modeConfig.KEY) private modeOptions: ConfigType<typeof modeConfig>,
  ) {}

  canActivate(): boolean {
    if (this.modeOptions.isProduction) throw new NotFoundException()

    return true
  }
}
