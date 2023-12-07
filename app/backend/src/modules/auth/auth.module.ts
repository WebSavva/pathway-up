import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/models/user.model';
import { Email } from '@/models/email.model';
import { CryptoModule } from '@/modules/crypto/crypto.module';
import { MailModule } from '@/modules/mail/mail.module';
import { PasswordChangeRequest } from '@/models/password-change-request.model';
import { UsersModule } from '@/modules/users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Email, PasswordChangeRequest]),
    MailModule,
    forwardRef(() => CryptoModule),
    forwardRef(() => UsersModule),
  ],

  controllers: [AuthController],

  providers: [AuthService,AuthGuard],

  exports: [AuthGuard],
})
export class AuthModule {}
