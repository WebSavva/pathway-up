import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Patch,
  Body,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Delete,
} from '@nestjs/common';
import { GROUPS } from '@pathway-up/constants';
import { UserPartialDto, UserPartialDtoSchema } from '@pathway-up/dtos';
import { DataSource } from 'typeorm';

import { AuthGuard } from '@/modules/auth/auth.guard';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { User } from '@/models/user.model';
import { CurrentUser } from '@/decorators/user.decorator';
import { SerializerService } from '@/modules/serializer/serializer.service';
import { FileStorageService } from '@/modules/file-storage/file-storage.service';

import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AvatarFilePipe } from './avatar-file.pipe';
import { Avatar } from '@/models/avatar.model';

@Controller('users')
export class UsersController {
  constructor(
    private serializerService: SerializerService,
    private usersService: UsersService,
    private fileStorageService: FileStorageService,
    private dataSource: DataSource,
  ) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  async getCurrentUser(@CurrentUser() currentUser: User) {
    const groups: GROUPS[] = [GROUPS.Self];

    if (currentUser.isAdmin) groups.push(GROUPS.Admin);

    return this.serializerService.serializeByGroups(currentUser, groups);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findUserById(id);

    if (!user) this.usersService.throwNotFoundUserException();

    return this.serializerService.serializeByGroups(user);
  }

  @UseGuards(AuthGuard)
  @Patch('/me')
  async patchMe(
    @Body(new ValidationPipe(UserPartialDtoSchema))
    partialUpdatedUser: UserPartialDto,
    @CurrentUser() currentUser: User,
  ) {
    const patchedUser = await this.usersService.patchUserById(
      currentUser.id,
      partialUpdatedUser,
    );

    const groups: GROUPS[] = [GROUPS.Self];

    if (currentUser.isAdmin) groups.push(GROUPS.Admin);

    return this.serializerService.serializeByGroups(patchedUser, groups);
  }

  @UseGuards(AuthGuard)
  @Post('/me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile(AvatarFilePipe) avatarFile: Express.Multer.File,
    @CurrentUser() currentUser: User,
  ) {
    const newAvatarFilename = this.fileStorageService.generateUniqueFilename(
      avatarFile.mimetype,
    );

    const newAvatarS3Key = `avatars/${newAvatarFilename}`;

    let newAvatar: Avatar;

    const currentAvatar = currentUser.avatar

    try {
      await this.dataSource.transaction(async (entityManager) => {
        if (currentAvatar) {
          currentAvatar.user = null;

          await entityManager.save(currentAvatar);
        }

        await this.fileStorageService.uploadFile(
          newAvatarS3Key,
          avatarFile.buffer,
        );

        newAvatar = new Avatar();
        newAvatar.user = currentUser;
        newAvatar.key = newAvatarS3Key;

        currentUser.avatar = newAvatar;

        try {
          await entityManager.save([newAvatar, currentUser]);
        } catch {
          await this.fileStorageService.deleteFile(newAvatarS3Key);
        }
      });
    } catch {
      if (currentAvatar) {
        currentAvatar.user = currentUser;
        await this.dataSource.manager.save(currentAvatar);
      }

      this.throwFailedAvatarUploadException();
    }

    return this.serializerService.serializeByGroups(newAvatar, [GROUPS.Self]);
  }

  @UseGuards(AuthGuard)
  @Delete('/me/avatar')
  async deleteAvatar(@CurrentUser() currentUser: User) {
    return this.usersService.deleteUserAvatar(currentUser.id);
  }

  private throwFailedAvatarUploadException() {
    throw new InternalServerErrorException('Upload of new avatar has failed !');
  }
}
