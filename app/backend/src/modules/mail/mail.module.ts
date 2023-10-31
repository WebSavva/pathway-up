import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { Options as SMTPOptions } from 'nodemailer/lib/smtp-transport';

import { Env } from '@/configurations';

export type T = SMTPOptions['from'];
import {
  MAIL_OPTIONS_INJECTION_KEY,
  MAIL_TRANSPORTER_INJECTION_KEY,
  MailOptions,
  MailService,
  MailTransporter,
} from './mail.service';
import { createMockedTransport } from './transporter.mock';
import { createTransport } from 'nodemailer';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MAIL_OPTIONS_INJECTION_KEY,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>): SMTPOptions => {
        const mailConfig = configService.get('mail', {
          infer: true,
        });

        const { from, host, password, port, user } = mailConfig;

        return {
          from,
          host,
          port,
          sender: from,
          secure: true,
          auth: {
            user,
            pass: password,
          },
        };
      },
    },
    {
      provide: MAIL_TRANSPORTER_INJECTION_KEY,
      inject: [MAIL_OPTIONS_INJECTION_KEY, ConfigService],
      useFactory: async (
        options: MailOptions,
        configService: ConfigService<Env>,
      ): Promise<MailTransporter> => {
        const isProd = configService.get('mode.isProduction', {
          infer: true,
        });

        if (!isProd) return createMockedTransport(options);

        const smtpTransporter = createTransport(options);

        await smtpTransporter.verify();

        return smtpTransporter;
      },
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
