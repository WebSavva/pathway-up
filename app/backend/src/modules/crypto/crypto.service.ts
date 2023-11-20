import crypto from 'crypto';

import { Injectable, Inject } from '@nestjs/common';
import { hash as hashPassword, compare as comparePasswords } from 'bcrypt';
import { ConfigType } from '@nestjs/config';
import jwt, { SignOptions, Algorithm } from 'jsonwebtoken';
import { defu } from 'defu';

import { jwtConfig } from '@/configurations/jwt.config';
import { cryptoConfig } from '@/configurations/crypto.config';

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

  constructor(
    @Inject(jwtConfig.KEY)
    { privateKey, algorithm }: ConfigType<typeof jwtConfig>,
    @Inject(cryptoConfig.KEY)
    private defaltCryptoConfig: ConfigType<typeof cryptoConfig>,
  ) {
    this.defaultJwtSignOptions = {
      privateKey,

      expiresIn: '1m',

      algorithm,
    };

    this.defaultJwtVerifyOptions = {
      privateKey,

      algorithm,
    };
  }

  hashPassword(
    plainPassword: string,
    saltRounds = this.defaltCryptoConfig.passwordHashSaltRounds,
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
