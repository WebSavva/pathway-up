import {
  Controller,
  Post,
  Body,
  UsePipes,
  Query,
  BadRequestException,
  Res,
  Inject,
  Req,
} from '@nestjs/common';
import { AuthUserDto, AuthUserDtoSchema } from '@pathway-up/dtos';
import { ConfigType } from '@nestjs/config';
import {
  ConfirmationPayloadSchema,
  ConfirmationPayload,
} from '@pathway-up/dtos';
import { joinURL } from 'ufo';
import { TemplateName } from '@pathway-up/email-templates';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';

import { Email } from '@/models/email.model';
import { ChangePasswordRequest } from '@/models/change-password-request';
import { CryptoService } from '@/modules/crypto/crypto.service';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { MailService } from '@/modules/mail/mail.service';
import { EmailType } from '@/constants/email-type.constant';
import { jwtConfig } from '@/configurations/jwt.config';
import { resendConfig } from '@/configurations/resend.config';
import { modeConfig } from '@/configurations/mode.config';
import { urlConfig } from '@/configurations/url.config';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(ChangePasswordRequest) private changePasswordRequestRepo: Repository<ChangePasswordRequest>,
    @Inject(jwtConfig.KEY) private jwtOptions: ConfigType<typeof jwtConfig>,
    @Inject(modeConfig.KEY) private modeOptions: ConfigType<typeof modeConfig>,
    @Inject(urlConfig.KEY) private urlOptions: ConfigType<typeof urlConfig>,
    @Inject(resendConfig.KEY)
    private resendOptions: ConfigType<typeof resendConfig>,
    private authService: AuthService,
    private cryptoService: CryptoService,
  ) {}

  @Post('/sign-up')
  @UsePipes(new ValidationPipe(AuthUserDtoSchema))
  public async signUp(
    @Body() authUserDto: AuthUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const signedUpUser = await this.authService.signUpUser(authUserDto);

    const { email, id, confirmationHash, name } = signedUpUser;

    const { isProduction: isProd } = this.modeOptions;

    // generating confirmation json webtoken
    const confirmationToken = await this.cryptoService.generateJwtToken(
      {
        confirmationHash,
      },
      {
        expiresIn: this.jwtOptions.signupRequestExpiresIn,
      },
    );

    // sending confirmation account email
    await this.authService.sendEmailConfirmationEmail(
      signedUpUser,
      confirmationToken,
    );

    const {
      signup: { cookie: resendCookieConfig },
    } = this.resendOptions;

    res.cookies.set(resendCookieConfig.name, id, {
      signed: true,
      maxAge: resendCookieConfig.maxAge,
    });

    return {
      email,
      id,
      name,
      confirmationToken: isProd ? undefined : confirmationToken,
    };
  }

  @Post('/sign-up/confirm')
  async confirmSignedUser(
    @Res({ passthrough: true }) res: Response,
    @Query('token') confirmationToken?: string,
  ) {
    if (!confirmationToken)
      throw new BadRequestException('No confirmation token was provided !');

    let payload: ConfirmationPayload;

    try {
      payload = await this.cryptoService.verifyJwtToken<ConfirmationPayload>(
        confirmationToken,
      );

      ConfirmationPayloadSchema.parse(payload);
    } catch (tokenVerificationError) {
      throw new BadRequestException('Invalid confirmation token was provided');
    }

    const confirmedUser = await this.authService.confirmSignedUpUser(
      payload.confirmationHash,
    );

    res.cookies.clear(this.resendOptions.signup.cookie.name);

    return confirmedUser;
  }

  @Post('/sign-up/resend')
  async resendSignUpConfirmationEmail(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = +req.signedCookies[this.resendOptions.signup.cookie.name];

    if (!userId)
      throw new BadRequestException('Invalid user data was provided !');

    const allUserSignUpEmails = await this.authService.findEmails(userId, EmailType.SignUpConfirm);

    const {
      resendOptions: {
        signup: { maxAttempts, interval },
      },
    } = this;

    if (allUserSignUpEmails.length >= maxAttempts)
      throw new BadRequestException(
        `Only ${maxAttempts} confirmation emails can be sent !`,
      );

    const [lastSignUpEmail] = allUserSignUpEmails;

    const secondPassedAfterLastEmail =
      (Date.now() - +lastSignUpEmail.sentAt) / 1e3;

    if (secondPassedAfterLastEmail < interval)
      throw new BadRequestException(
        `Confirmation email can be sent every ${interval / 60} minutes !`,
      );

    const { user } = lastSignUpEmail;

    const { confirmationHash } = user;

    // generating confirmation json webtoken
    const confirmationToken = await this.cryptoService.generateJwtToken(
      {
        confirmationHash,
      },
      {
        expiresIn: this.jwtOptions.signupRequestExpiresIn,
      },
    );

    // sending confirmation account email
    await this.authService.sendEmailConfirmationEmail(user, confirmationToken);
  }

  @Post('/restore')
  @UsePipes(new ValidationPipe(AuthUserDtoSchema))
  async restorePassword(@Body() {
    email,
    password
  }: AuthUserDto) {
    const existingUser = await this.authService.findUserByEmail(email);

    if (!existingUser || !existingUser.isConfirmed) throw new BadRequestException('Invalid user data was provided !');

    const lastChangePasswordRequest = await this.changePasswordRequestRepo.findOne({
      where: {
        user: existingUser,
      },

      order: {
        createdAt: 'DESC',
      }
    })


    if (lastChangePasswordRequest) {
      const {
        changePassword: {
          interval
        }
      } = this.resendOptions;

      const passedMiliSecondsAfterLastRequest = Date.now() - (interval * 1e3 + +lastChangePasswordRequest.createdAt);

      if (passedMiliSecondsAfterLastRequest < 0) throw new BadRequestException(`Password can be changed only every ${interval / 60} minutes !`);
    }

    const changePasswordRequest = await this.changePasswordRequestRepo.create();

    const confirmationHash = this.cryptoService.generateHash();

    changePasswordRequest.newPasswordHash = await this.cryptoService.hashPassword(password);
    changePasswordRequest.oldPasswordHash = existingUser.passwordHash;
    changePasswordRequest.user = existingUser;
    changePasswordRequest.confirmationHash =  confirmationHash;

    await this.changePasswordRequestRepo.save(changePasswordRequest);

    // sending email
    const confirmationToken = this.cryptoService.generateJwtToken({
      confirmationHash,
    }, {
      expiresIn: this.jwtOptions.passwordChangeRequestExpiresIn,
    });

    return this.modeOptions.isDev ? {
      confirmationHash
    } : null;
  }
}
