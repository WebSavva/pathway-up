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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';

import { Email } from '@/models/email.model';
import { CryptoService } from '@/modules/crypto/crypto.service';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { MailService } from '@/modules/mail/mail.service';
import { EmailType } from '@/constants/email-type.constant';
import { jwtConfig } from '@/configurations/jwt.config';
import { resendConfig } from '@/configurations/resend.config';
import { modeConfig } from '@/configurations/mode.config';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(Email) private emailRepo: Repository<Email>,
    @Inject(jwtConfig.KEY) private jwtOptions: ConfigType<typeof jwtConfig>,
    @Inject(modeConfig.KEY) private modeOptions: ConfigType<typeof modeConfig>,
    @Inject(resendConfig.KEY)
    private resendOptions: ConfigType<typeof resendConfig>,
    private authService: AuthService,
    private cryptoService: CryptoService,
    private mailService: MailService,
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
    await this.mailService.sendMail('SignUpConfirmEmailTemplate', {
      to: email,
      templateProps: {
        confirmUrl: `https://localhost:3000/config?token=${confirmationToken}`,
        username: name,
      },
    });

    const signUpEmail = await this.emailRepo.create();

    signUpEmail.type = EmailType.signUpConfirm;
    signUpEmail.user = signedUpUser;

    await this.emailRepo.save(signUpEmail);

    const {
      signup: { cookie },
    } = this.resendOptions;
    res.cookies.set(cookie.name, id, {
      signed: true,
      maxAge: cookie.maxAge,
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

    const allUserSignUpEmails = await this.emailRepo.find({
      relations: {
        user: true,
      },

      where: {
        user: {
          id: userId,
        },
      },

      order: {
        sentAt: 'DESC',
      },
    });

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

    const {user} = lastSignUpEmail;

    const {
      confirmationHash,
    } = user;

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
    await this.mailService.sendMail('SignUpConfirmEmailTemplate', {
      to: email,
      templateProps: {
        confirmUrl: `https://localhost:3000/config?token=${confirmationToken}`,
        username: name,
      },
    });

    const signUpEmail = await this.emailRepo.create();

    signUpEmail.type = EmailType.signUpConfirm;
    signUpEmail.user = signedUpUser;

    await this.emailRepo.save(signUpEmail);

  }
}
