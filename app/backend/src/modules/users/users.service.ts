import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { User } from '@/models/user.model';
import { Avatar } from '@/models/avatar.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Avatar) private avatarRepository: Repository<Avatar>,
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

  public async deleteUserAvatar(userId) {
    const user = await this.findUserById(userId)

    const {
      avatar
    } = user;

    if (!avatar) return true;

    avatar.user = null;

    await this.avatarRepository.save(avatar);

    return true;
  }

  public getAllStaleAvatars() {
    return this.avatarRepository.find({
      where: {
        user: IsNull()
      }
    });
  }
}
