import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/models/user.model';
import { Email } from '@/models/email.model';
import { CryptoModule } from '@/modules/crypto/crypto.module';
import { MailModule } from '@/modules/mail/mail.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Email]), CryptoModule, MailModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
