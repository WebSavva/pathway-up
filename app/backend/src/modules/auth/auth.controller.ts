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

import { CryptoService } from '@/modules/crypto/crypto.service';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { Env } from '@/configurations';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cryptoService: CryptoService,
    private envService: ConfigService<Env>,
  ) {}

  @Post('/sign-up')
  @UsePipes(new ValidationPipe(AuthUserDtoSchema))
  public async signUp(@Body() authUserDto: AuthUserDto) {
    const { email, id, confirmationHash } = await this.authService.signUpUser(
      authUserDto,
    );

    const isProd = await this.envService.get('mode.isProduction', {
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

    return {
      email,
      id,
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
