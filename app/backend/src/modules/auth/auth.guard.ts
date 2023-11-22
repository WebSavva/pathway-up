import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthPayload, AuthPayloadSchema } from '@pathway-up/dtos';

import { User } from '@/models/user.model';
import { CryptoService } from '@/modules/crypto/crypto.service';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private cryptoService: CryptoService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authToken = this.extractTokenFromHeader(request);

    const throwUnauthorizedException = () => {
      throw new UnauthorizedException();
    };

    if (!authToken) throwUnauthorizedException();

    let user: User;

    try {
      const authPayload = await this.cryptoService.verifyJwtToken<AuthPayload>(
        authToken,
      );

      AuthPayloadSchema.parse(authPayload);

      user = await this.usersService.findUserById(authPayload.userId);
    } catch {
      throwUnauthorizedException();
    }

    if (!user) throwUnauthorizedException();

    request['user'] = user;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
