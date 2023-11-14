import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUserDto } from '@pathway-up/dtos';
import { ConfigType } from '@nestjs/config';
import { TemplateName } from '@pathway-up/email-templates';
import { joinURL } from 'ufo';

import { User } from '@/models/user.model';
import { CryptoService } from '@/modules/crypto/crypto.service';
import { Email } from '@/models/email.model';
import { urlConfig } from '@/configurations/url.config';
import { jwtConfig } from '@/configurations/jwt.config';
import { MailService } from '@/modules/mail/mail.service';
import { EmailType } from '@/constants/email-type.constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
    @InjectRepository(Email) private EmailRepository: Repository<Email>,
    private cryptoService: CryptoService,
    @Inject(urlConfig.KEY) private urlOptions: ConfigType<typeof urlConfig>,
    @Inject(jwtConfig.KEY) private jwtOptions: ConfigType<typeof jwtConfig>,
    private mailService: MailService,
  ) {}

  throwInvalidUserException() {
    throw new BadRequestException('Invalid user data was provided !');
  }

  validateUnconfirmedUser(user: User) {
    if (!user || user.isConfirmed) this.throwInvalidUserException();

    const expiresAfter = new Date(
      +user.createdAt + this.jwtOptions.signupRequestExpiresIn * 1e3,
    );

    const today = new Date();

    if (today > expiresAfter) this.throwInvalidUserException();
  }

  async signUpUser(authUserDto: AuthUserDto) {
    const existingUser = await this.UserRepository.findOneBy({
      email: authUserDto.email,
    });

    if (existingUser) this.throwInvalidUserException();

    const { email, password } = authUserDto;
    const confirmationHash = this.cryptoService.generateHash();

    const passwordHash = await this.cryptoService.hashPassword(password);

    const newUser = await this.UserRepository.create({
      email,
      passwordHash,
      confirmationHash,
      name: email.split('@')[0],
    });

    return this.UserRepository.save(newUser);
  }

  async confirmSignedUpUser(confirmationHash: string) {
    const userToBeConfirmed = await this.UserRepository.findOneBy({
      confirmationHash,
    });

    this.validateUnconfirmedUser(userToBeConfirmed);

    userToBeConfirmed.isConfirmed = true;

    return this.UserRepository.save(userToBeConfirmed);
  }

  async sendEmailConfirmationEmail(user: User, token: string) {
    const { email, name } = user;

    // sending confirmation account email
    await this.mailService.sendMail(TemplateName.SignUpConfirmEmail, {
      to: email,
      templateProps: {
        confirmUrl: `${joinURL(
          this.urlOptions.clientBaseUrl,
          '/config',
        )}?token=${token}`,
        username: name,
      },
    });

    const signUpEmail = await this.EmailRepository.create();

    signUpEmail.type = EmailType.SignUpConfirm;
    signUpEmail.user = user;

    return this.EmailRepository.save(signUpEmail);
  }

  findUserByEmail(email: string) {
    return this.UserRepository.findOneBy({
      email,
    });
  }

  findEmails(userId: number, type: EmailType) {
    return this.EmailRepository.find({
      relations: {
        user: true,
      },

      where: {
        user: {
          id: userId,
        },
        type: type,
      },

      order: {
        sentAt: 'DESC',
      },
    });
  }
}
