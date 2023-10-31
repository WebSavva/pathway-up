import { NestMiddleware } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { ConfigService } from '@nestjs/config';
import { Env } from '@/configurations';

export class CookiesMiddleware implements NestMiddleware {
  cookieHandler: ReturnType<typeof cookieParser>;

  constructor(private configService: ConfigService<Env>) {
    this.cookieHandler = cookieParser()
  }
}
