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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';
import { EMAIL_TYPES } from '@pathway-up/constants';

import { PasswordChangeRequest } from '@/models/password-change-request.model';
import { CryptoService } from '@/modules/crypto/crypto.service';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { jwtConfig } from '@/configurations/jwt.config';
import { resendConfig } from '@/configurations/resend.config';
import { modeConfig } from '@/configurations/mode.config';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(PasswordChangeRequest)
    private passwordChangeRequestRepo: Repository<PasswordChangeRequest>,
    @Inject(jwtConfig.KEY) private jwtOptions: ConfigType<typeof jwtConfig>,
    @Inject(modeConfig.KEY) private modeOptions: ConfigType<typeof modeConfig>,
    @Inject(resendConfig.KEY)
    private resendOptions: ConfigType<typeof resendConfig>,
    private authService: AuthService,
    private cryptoService: CryptoService,
  ) {}

  @Post('/login')
  @UsePipes(new ValidationPipe(AuthUserDtoSchema))
  public async login(@Body() { email, password }: AuthUserDto) {
    const user = await this.authService.findUserByEmail(email);

    this.authService.validateConfirmedUser(user);

    const arePasswordsEqual = await this.cryptoService.comparePasswords(
      password,
      user.passwordHash,
    );

    if (!arePasswordsEqual) this.authService.throwInvalidUserException();

    const authToken = await this.authService.generateAuthToken(user.id);

    return {
      token: authToken,
    };
  }

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
      maxAge: resendCookieConfig.maxAge * 1e3,
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
    const payload = await this.authService.verifyConfirmationToken(
      confirmationToken,
    );

    const confirmedUser = await this.authService.confirmSignedUpUser(
      payload.confirmationHash,
    );

    res.cookies.clear(this.resendOptions.signup.cookie.name);

    return confirmedUser;
  }

  @Post('/sign-up/resend')
  async resendSignUpConfirmationEmail(@Req() req: Request) {
    const userId = +req.signedCookies[this.resendOptions.signup.cookie.name];

    if (!userId)
      throw new BadRequestException('Invalid user data was provided !');

    const allUserSignUpEmails = await this.authService.findEmails(
      userId,
      EMAIL_TYPES.SignUpConfirm,
    );

    const [lastSignUpEmail] = allUserSignUpEmails;
    const { user } = lastSignUpEmail;

    this.authService.validateUnconfirmedUser(user);

    const {
      resendOptions: {
        signup: { maxAttempts, interval },
      },
    } = this;

    if (allUserSignUpEmails.length >= maxAttempts)
      throw new BadRequestException(
        `Only ${maxAttempts} confirmation emails can be sent !`,
      );

    const secondsPassedAfterLastEmail =
      (Date.now() - +lastSignUpEmail.sentAt) / 1e3;

    if (secondsPassedAfterLastEmail < interval)
      throw new BadRequestException(
        `Confirmation email can be sent every ${interval / 60} minutes !`,
      );

    const { confirmationHash } = user;

    // generating confirmation json webtoken
    const confirmationToken = await this.authService.generateConfirmationToken(
      confirmationHash,
      this.jwtOptions.signupRequestExpiresIn,
    );

    // sending confirmation account email
    await this.authService.sendEmailConfirmationEmail(user, confirmationToken);
  }

  @Post('/restore')
  @UsePipes(new ValidationPipe(AuthUserDtoSchema))
  async restorePassword(@Body() { email, password }: AuthUserDto) {
    const existingUser = await this.authService.findUserByEmail(email);

    if (!existingUser || !existingUser.isConfirmed)
      this.authService.throwInvalidUserException();

    const lastPasswordChangeRequest =
      await this.passwordChangeRequestRepo.findOne({
        where: {
          user: {
            id: existingUser.id,
          },
        },

        order: {
          createdAt: 'DESC',
        },
      });

    if (lastPasswordChangeRequest) {
      const {
        changePassword: { interval },
      } = this.resendOptions;

      const allowedAfter =
        interval * 1e3 + +lastPasswordChangeRequest.createdAt;

      if (Date.now() < allowedAfter)
        throw new BadRequestException(
          `Password can be changed only every ${interval / 60} minutes !`,
        );
    }

    const passwordChangeRequest = await this.passwordChangeRequestRepo.create();

    const confirmationHash = this.cryptoService.generateHash();

    passwordChangeRequest.newPasswordHash =
      await this.cryptoService.hashPassword(password);
    passwordChangeRequest.user = existingUser;
    passwordChangeRequest.confirmationHash = confirmationHash;

    await this.passwordChangeRequestRepo.save(passwordChangeRequest);

    // sending email
    const confirmationToken = await this.authService.generateConfirmationToken(
      confirmationHash,
      this.jwtOptions.passwordChangeRequestExpiresIn,
    );

    await this.authService.sendPasswordChangeConfirmationEmail(
      existingUser,
      confirmationToken,
    );

    return this.modeOptions.isDev
      ? {
          confirmationToken,
        }
      : true;
  }

  @Post('/restore/confirm')
  async confirmPasswordRestore(@Query('token') confirmationToken?: string) {
    const { confirmationHash } = await this.authService.verifyConfirmationToken(
      confirmationToken,
    );

    return this.authService.confirmPasswordChangeRequest(confirmationHash);
  }
}
