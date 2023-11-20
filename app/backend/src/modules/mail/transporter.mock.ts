import { writeFile, ensureDir } from 'fs-extra';
import upperFirst from 'lodash/upperCase';
import { Transporter } from 'nodemailer';
import { Options as SMTPOptions } from 'nodemailer/lib/smtp-transport';
import { Options as SendMailOptions, Address } from 'nodemailer/lib/mailer';
import crypto from 'crypto';

export class MockedTransporter {
  async sendMail(options: SendMailOptions) {
    const eml = this.buildEml(options);

    await ensureDir('dist/mail');

    await writeFile(
      `dist/mail/${crypto.randomBytes(10).toString('hex')}.eml`,
      eml,
      'utf-8',
    );
  }

  private formatAddress({ name, address }: Address) {
    return `${name} <${address}>`;
  }

  private toEmailAddress(
    emailAddress: string | Address | Array<string | Address>,
  ): string {
    if (typeof emailAddress == 'string') {
      return emailAddress;
    } else if (Array.isArray(emailAddress)) {
      return emailAddress
        .map((subEmailAddress) => this.toEmailAddress(subEmailAddress))
        .join(', ');
    } else {
      return `${emailAddress.name} <${emailAddress.address}>`;
    }
  }

  buildEml({
    headers: rawHeaders = {},
    subject,
    from,
    to,
    cc,
    text,
    html,
    attachments,
  }: SendMailOptions = {}) {
    const EOL = '\r\n'; //End-of-line

    const headers: SendMailOptions['headers'] = {
      ...rawHeaders,
    };

    if (subject) {
      headers['Subject'] = subject;
    }

    Object.entries({
      from,
      to,
      cc,
    })
      .filter(([, value]) => value)
      .forEach(([name, value]) => {
        headers[upperFirst(name)] = this.toEmailAddress(value);
      });

    const eml: string[] = [];

    const boundary = `---=${crypto.randomBytes(16).toString('hex')}`;

    headers[
      'Content-Type'
    ] = `multipart/mixed;${EOL}boundary="---=${boundary}"`;

    //Build headers
    Object.entries(headers).forEach(([name, value]) => {
      const formatValue = (val: string) => val.replace(/\r?\n/g, EOL + '  ');

      if (!value) return;

      const normalizedValue = Array.isArray(value) ? value : [value];

      normalizedValue.forEach((subValue) =>
        eml.push(`${name}:${formatValue(subValue)}${EOL}`),
      );
    });

    //Start the body
    eml.push(EOL);

    //Plain text content
    if (text) {
      eml.push(
        ...[
          `--${boundary}${EOL}`,
          `Content-Type: text/plain; charset=utf-8${EOL}`,
          EOL,
          text.toString(),
          EOL,
          EOL,
        ],
      );
    }

    //HTML content
    if (html) {
      eml.push(
        ...[
          `--${boundary}${EOL}`,
          `Content-Type: text/html; charset=utf-8${EOL}`,
          EOL,
          html.toString(),
          EOL,
          EOL,
        ],
      );
    }

    //Append attachments
    if (attachments) {
      attachments.forEach(({ filename, contentType, cid, content }, index) => {
        let base64Content = '';

        if (typeof content === 'string') {
          base64Content = Buffer.from(content).toString('base64');
        } else if (content) {
          base64Content = content.toString('base64');
        }

        eml.push(
          ...[
            `--${boundary}${EOL}`,
            `Content-Type: ${contentType || 'application/octet-stream'}`,
            EOL,
            'Content-Transfer-Encoding: base64',
            EOL,
            `Content-Disposition: attachment; filename="${
              filename || `attachemnt_${index + 1}`
            }"`,
            EOL,
            cid ? `Content-ID: <${cid}>` : '',
            base64Content,
            EOL,
          ],
        );
      });

      eml.push(`--${boundary}--${EOL}`);
    }

    return eml.join('');
  }
}

export const createMockedTransport = (options: any) =>
  new MockedTransporter() as unknown as Transporter<SMTPOptions>;
