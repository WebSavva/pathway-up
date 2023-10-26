import {
  Injectable,
  FactoryProvider,
  ModuleMetadata,
  Inject,
} from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import type { Options as SendMailOptions } from 'nodemailer/lib/mailer';
import type { Options as SMTPOptions } from 'nodemailer/lib/smtp-transport';
import * as EMAIL_TEMPLATES from '@pathway-up/email-templates';
import { ConfigService } from '@nestjs/config';

import { Env } from '@/configurations';

export const MAIL_OPTIONS_INJECTION_KEY = 'mailer-options';

export type MailModuleOptions = SMTPOptions & {
  from: string;
};

export type MailerOptionsFactoryProvider = Pick<
  FactoryProvider<MailModuleOptions>,
  'inject' | 'useFactory'
> &
  Pick<Required<ModuleMetadata>, 'imports'>;

export type EmailTemplateName = keyof typeof EMAIL_TEMPLATES;

@Injectable()
export class MailerService {
  transporter: Transporter<MailModuleOptions>;

  constructor(
    @Inject(MAIL_OPTIONS_INJECTION_KEY) private options: MailModuleOptions,
    configService: ConfigService<Env>,
  ) {
    const {
      from: _,

      ...smtpOptions
    } = options;

    this.transporter = createTransport(smtpOptions);
  }

  sendMail<T extends EmailTemplateName>(
    name: T,
    options: SendMailOptions & {
      templateProps: Parameters<(typeof EMAIL_TEMPLATES)[T]>[0];
    },
  ) {
    const {
      templateProps,

      ...mailOptions
    } = options;

    const { text, html } = EMAIL_TEMPLATES[name](templateProps);

    return this.transporter.sendMail({
      from: this.options.from,
      sender: this.options.from,
      ...mailOptions,
      html,
      text,
    });
  }
}
