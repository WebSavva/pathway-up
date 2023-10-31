import {
  Controller,
  Post,
  Body,
  UsePipes,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthUserDto, AuthUserDtoSchema } from '@pathway-up/dtos';
import { ConfigService } from '@nestjs/config';
import {
  ConfirmationPayloadSchema,
  ConfirmationPayload,
} from '@pathway-up/dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from '@/models/email.model';

import { CryptoService } from '@/modules/crypto/crypto.service';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { Env } from '@/configurations';
import { MailService } from '@/modules/mail/mail.service';
import { EmailType } from '@/constants/email-type.constant';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(Email) private emailRepo: Repository<Email>,
    private authService: AuthService,
    private cryptoService: CryptoService,
    private envService: ConfigService<Env>,
    private mailService: MailService,
  ) {}

  @Post('/sign-up')
  @UsePipes(new ValidationPipe(AuthUserDtoSchema))
  public async signUp(@Body() authUserDto: AuthUserDto) {
    const signedUpUser = await this.authService.signUpUser(authUserDto);

    const { email, id, confirmationHash, name } = signedUpUser;

    const { isProduction: isProd } = this.envService.get('mode', {
      infer: true,
    });

    // generating confirmation json webtoken
    const confirmationToken = await this.cryptoService.generateJwtToken(
      {
        confirmationHash,
      },
      {
        expiresIn: this.envService.get('jwt.signupRequestExpiresIn', {
          infer: true,
        }),
      },
    );

    // sending confirmation account email
    await this.mailService.sendMail('SignUpConfirmEmailTemplate', {
      to: email,
      templateProps: {
        confirmUrl: `https://localhost:3000/config?confirmHash=${confirmationHash}`,
        username: name,
      },
    });

    const signUpEmail = await this.emailRepo.create();

    signUpEmail.type = EmailType.signUpConfirm;
    signUpEmail.user = signedUpUser;

    await this.emailRepo.save(signUpEmail);

    return {
      email,
      id,
      name,
      confirmationToken: isProd ? undefined : confirmationToken,
    };
  }

  @Post('/sign-up/confirm')
  async confirmSignedUser(@Query('token') confirmationToken?: string) {
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

    return confirmedUser;
  }
}
