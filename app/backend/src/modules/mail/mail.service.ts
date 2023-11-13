import { Injectable, Inject } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import type { Options as SendMailOptions } from 'nodemailer/lib/mailer';
import type { Options as SMTPOptions } from 'nodemailer/lib/smtp-transport';
import { templates, TemplateName, Templates }from '@pathway-up/email-templates';

export const MAIL_OPTIONS_INJECTION_KEY = 'mail-options';

export const MAIL_TRANSPORTER_INJECTION_KEY = 'mail-transporter';

export type MailTransporter = Transporter<SMTPOptions>;

export type MailOptions = SMTPOptions;


@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_OPTIONS_INJECTION_KEY) private options: SMTPOptions,
    @Inject(MAIL_TRANSPORTER_INJECTION_KEY) public transporter: MailTransporter,
  ) {}

  sendMail<N extends TemplateName>(
    name: N,
    options: SendMailOptions & {
      templateProps: Parameters<Templates[N]>[0];
    },
  ) {
    const {
      templateProps,

      ...mailOptions
    } = options;

    const { text, html } = templates[name](templateProps);

    return this.transporter.sendMail({
      ...mailOptions,
      html,
      text,
    });
  }
}
