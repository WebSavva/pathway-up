import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Raw } from 'typeorm';
import { ConfigType } from '@nestjs/config';

import { filesConfig } from '@/configurations/files.config';
import { User } from '@/models/user.model';
import { Avatar } from '@/models/avatar.model';
import { FileStorageService } from '@/modules/file-storage/file-storage.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Avatar) private avatarRepository: Repository<Avatar>,
    @Inject(filesConfig.KEY) private filesOptions: ConfigType<typeof filesConfig>,
    private fileStorageService: FileStorageService
  ) {}

  public findUserByField<K extends keyof User>(fieldName: K, value: any) {
    return this.userRepository.findOneBy({
      [fieldName]: value,
    });
  }

  public findUserById(id: number) {
    return this.findUserByField('id', id);
  }

  public findUserByEmail(email: string) {
    return this.findUserByField('email', email);
  }

  public throwNotFoundUserException() {
    throw new NotFoundException('No user was found !');
  }

  public async patchUserById(id: number, partialUser: Partial<User>) {
    await this.userRepository.update(id, partialUser);

    return this.findUserById(id);
  }

  public async deleteUserAvatarByUserId(userId) {
    const user = await this.findUserById(userId)

    const {
      avatar
    } = user;

    if (!avatar) return;

    await this.deleteUserAvatar(avatar);
  }

  public async deleteUserAvatar(avatar: Avatar) {
    await this.fileStorageService.deleteFile(avatar.key)

    await this.avatarRepository.remove(avatar);
  }

  public getAllStaleAvatars() {
    return this.avatarRepository.find({
      where: {
        user: IsNull(),
        createdAt: Raw((alias) => {
          const res = `(CURRENT_TIMESTAMP - ${alias}) > INTERVAL '${this.filesOptions.avatar.staleDuration} sec'`;

          return res;
        })
      }
    });
  }
}
