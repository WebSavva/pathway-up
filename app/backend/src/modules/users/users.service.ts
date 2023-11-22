import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@/models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
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
}
