import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/models/user.model';
import { AuthModule } from '@/modules/auth/auth.module';
import { CryptoModule } from '@/modules/crypto/crypto.module';
import { FileStorageModule } from '@/modules/file-storage/file-storage.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Avatar } from '@/models/avatar.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Avatar]),
    forwardRef(() => AuthModule),
    CryptoModule,
    FileStorageModule,
  ],

  controllers: [UsersController],

  providers: [UsersService],

  exports: [UsersService],
})
export class UsersModule {}
