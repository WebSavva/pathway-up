import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  AuthUserDto,
  ConfirmationPayloadSchema,
  ConfirmationPayload,
  AuthPayloadSchema,
  AuthPayload,
} from '@pathway-up/dtos';
import { ConfigType } from '@nestjs/config';
import { TemplateName } from '@pathway-up/email-templates';
import { joinURL } from 'ufo';

import { User } from '@/models/user.model';
import { CryptoService } from '@/modules/crypto/crypto.service';
import { Email } from '@/models/email.model';
import { urlConfig } from '@/configurations/url.config';
import { jwtConfig } from '@/configurations/jwt.config';
import { MailService } from '@/modules/mail/mail.service';
import { EMAILS } from '@pathway-up/constants';
import { PasswordChangeRequest } from '@/models/password-change-request.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
    @InjectRepository(Email) private EmailRepository: Repository<Email>,
    @InjectRepository(PasswordChangeRequest)
    private PasswordChangeRequestRepository: Repository<PasswordChangeRequest>,
    private cryptoService: CryptoService,
    @Inject(urlConfig.KEY) private urlOptions: ConfigType<typeof urlConfig>,
    @Inject(jwtConfig.KEY) private jwtOptions: ConfigType<typeof jwtConfig>,
    private mailService: MailService,
    private dataSource: DataSource,
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

    return true;
  }

  validateConfirmedUser(user: User) {
    if (!user || !user.isConfirmed) this.throwInvalidUserException();

    return true;
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
    userToBeConfirmed.confirmedAt = new Date();

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

    signUpEmail.type = EMAILS.SignUpConfirm;
    signUpEmail.user = user;

    return this.EmailRepository.save(signUpEmail);
  }

  async sendPasswordChangeConfirmationEmail(user: User, token: string) {
    const { email, name } = user;

    // sending confirmation account email
    await this.mailService.sendMail(TemplateName.PasswordChangeConfirmEmail, {
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

    signUpEmail.type = EMAILS.PasswordChangeConfirm;
    signUpEmail.user = user;

    return this.EmailRepository.save(signUpEmail);
  }

  findUserByEmail(email: string) {
    return this.UserRepository.findOneBy({
      email,
    });
  }

  findEmails(userId: number, type: EMAILS) {
    return this.EmailRepository.find({
      relations: {
        user: true,
      },

      where: {
        user: {
          id: userId,
        },

        type,
      },

      order: {
        sentAt: 'DESC',
      },
    });
  }

  generateConfirmationToken(confirmationHash: string, expiresIn: number) {
    return this.cryptoService.generateJwtToken(
      {
        confirmationHash,
      },
      {
        expiresIn,
      },
    );
  }

  generateAuthToken(
    userId: number,
    expiresIn: number = this.jwtOptions.authExpiresIn,
  ) {
    return this.cryptoService.generateJwtToken(
      {
        userId,
      },
      {
        expiresIn,
      },
    );
  }

  async verifyConfirmationToken(confirmationToken?: string) {
    if (!confirmationToken)
      throw new BadRequestException('No confirmation token was provided !');

    try {
      const payload =
        await this.cryptoService.verifyJwtToken<ConfirmationPayload>(
          confirmationToken,
        );

      ConfirmationPayloadSchema.parse(payload);

      return payload;
    } catch {
      throw new BadRequestException('Invalid confirmation token was provided');
    }
  }

  async verifyAuthToken(authToken: string) {
    if (!authToken)
      throw new BadRequestException('No authentication token was provided !');

    try {
      const payload = await this.cryptoService.verifyJwtToken<AuthPayload>(
        authToken,
      );

      AuthPayloadSchema.parse(payload);

      return payload;
    } catch {
      throw new BadRequestException('Invalid authenication token was provided');
    }
  }

  throwInvalidPasswordChangeRequestError() {
    return new BadRequestException(
      'Invalid change password request data was provided !',
    );
  }

  async confirmPasswordChangeRequest(confirmationHash: string) {
    const passwordChangeRequest =
      await this.PasswordChangeRequestRepository.findOne({
        where: {
          confirmationHash,
        },

        relations: {
          user: true,
        },
      });

    if (!passwordChangeRequest || passwordChangeRequest.isConfirmed)
      this.throwInvalidPasswordChangeRequestError();

    // checking expiration date
    const { passwordChangeRequestExpiresIn } = this.jwtOptions;

    const expiresAfterInSeconds =
      +passwordChangeRequest.createdAt / 1e3 + passwordChangeRequestExpiresIn;

    const currentDateInSeconds = Date.now() / 1e3;

    if (currentDateInSeconds > expiresAfterInSeconds)
      this.throwInvalidPasswordChangeRequestError();

    await this.dataSource.transaction(async (entityManager) => {
      const { newPasswordHash, user } = passwordChangeRequest;

      const oldPasswordHash = user.passwordHash;

      user.passwordHash = newPasswordHash;

      await entityManager.save(user);

      passwordChangeRequest.confirmedAt = new Date();
      passwordChangeRequest.isConfirmed = true;
      passwordChangeRequest.oldPasswordHash = oldPasswordHash;

      await entityManager.save(passwordChangeRequest);
    });

    return true;
  }
}
