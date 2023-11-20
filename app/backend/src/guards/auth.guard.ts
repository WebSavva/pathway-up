import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CryptoService } from '@/modules/crypto/crypto.service';
import { Request } from 'express';
import { AuthPayload, AuthPayloadSchema } from '@pathway-up/dtos';
import { User } from '@/models/user.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CryptoService) private cryptoService: CryptoService,
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

      AuthPayloadSchema.parse(authPayload);

      const user = await this.dataSource.getRepository(User).findOne({
        where: {
          id: authPayload.userId,
        },
      });

      if (!user) throwUnauthorizedException();

      request['user'] = user;
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
