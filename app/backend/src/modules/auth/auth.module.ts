import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/models/user.model';
import { CryptoModule } from '@/modules/crypto/crypto.module'

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CryptoModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
