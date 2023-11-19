import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CryptoService } from '@/modules/crypto/crypto.service';
import { Request } from 'express';
import { AuthPayload, AuthPayloadSchema } from '@pathway-up/dtos';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private cryptoService: CryptoService,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authToken = this.extractTokenFromHeader(request);

    const throwUnauthorizedException = () => new UnauthorizedException();

    if (!authToken) throwUnauthorizedException();

    try {
      const authPayload = await this.cryptoService.verifyJwtToken<AuthPayload>(
        authToken,
      );

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
