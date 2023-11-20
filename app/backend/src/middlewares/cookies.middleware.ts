import { NestMiddleware, Inject } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction, CookieOptions } from 'express';

import { ConfigType } from '@nestjs/config';
import { cookiesConfig } from '@/configurations/cookies.config';

declare global {
  // eslint-disable-next-line
  namespace Express {
    interface Response {
      cookies: {
        clear(name: string, options?: CookieOptions): Response;

        set(name: string, val: string, options: CookieOptions): Response;
        set(name: string, val: any, options: CookieOptions): Response;
        set(name: string, val: any): Response;
      };
    }

    interface Request {
      cookies: Record<string, any>;
      signedCookies: Record<string, any>;
    }
  }
}

export class CookiesMiddleware implements NestMiddleware {
  cookieHandler: ReturnType<typeof cookieParser>;
  setCookieOptions: CookieOptions;

  constructor(
    @Inject(cookiesConfig.KEY)
    { domain, secret }: ConfigType<typeof cookiesConfig>,
  ) {
    this.setCookieOptions = {
      domain,
    };

    this.cookieHandler = cookieParser(secret);
  }

  use(req: Request, res: Response, next: NextFunction) {
    res.cookies = {
      set: (name: string, val: any, options: CookieOptions = {}) => {
        return res.cookie(name, val, {
          ...this.setCookieOptions,
          ...options,
        });
      },

      clear: (name: string, options: CookieOptions = {}) => {
        return res.clearCookie(name, {
          ...this.setCookieOptions,
          ...options,
        });
      },
    };

    return this.cookieHandler(req, res, next);
  }
}
