import crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import { hash as hashPassword, compare as comparePasswords } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';
import { defu } from 'defu';

import { Env } from '@/configurations';

export type JwtSignOptions = Pick<SignOptions, 'algorithm' | 'expiresIn'> & {
  privateKey: string;
};

export type JwtVerifyOptions = {
  algorithm: Algorithm;
  privateKey: string;
};

@Injectable()
export class CryptoService {
  defaultJwtSignOptions: JwtSignOptions;
  defaultJwtVerifyOptions: JwtVerifyOptions;

  constructor(private envService: ConfigService<Env>) {
    this.defaultJwtSignOptions = {
      privateKey: this.envService.get('jwt.privateKey', {
        infer: true,
      }),

      expiresIn: '1m',

      algorithm: this.envService.get('jwt.algorithm', {
        infer: true,
      }),
    };

    this.defaultJwtVerifyOptions = {
      privateKey: this.envService.get('jwt.privateKey', {
        infer: true,
      }),

      algorithm: this.envService.get('jwt.algorithm', {
        infer: true,
      }),
    };
  }

  hashPassword(
    plainPassword: string,
    saltRounds = this.envService.get('crypto.passwordHashSaltRounds', {
      infer: true,
    }),
  ) {
    return hashPassword(plainPassword, saltRounds);
  }

  comparePasswords(plainPassword, passwordHash) {
    return comparePasswords(plainPassword, passwordHash);
  }

  generateJwtToken(
    payload: Record<string, any>,
    options: Partial<JwtSignOptions> = {},
  ) {
    const { privateKey, ...signOptions } = defu(
      options,
      this.defaultJwtSignOptions,
    );

    return new Promise<string>((resolve, reject) => {
      jwt.sign(payload, privateKey, signOptions, (err, token) => {
        if (err) return reject(err);

        resolve(token);
      });
    });
  }

  verifyJwtToken<P extends Record<string, any>>(
    token: string,
    options: Partial<JwtVerifyOptions> = {},
  ) {
    const { algorithm, privateKey } = defu(
      options,
      this.defaultJwtVerifyOptions,
    );

    return new Promise<P>((resolve, reject) => {
      jwt.verify(
        token,
        privateKey,
        {
          algorithms: [algorithm],
        },
        (err, payload) => {
          if (err) return reject(err);

          resolve(payload as P);
        },
      );
    });
  }

  generateHash(bytes = 32) {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
