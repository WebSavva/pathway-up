import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUserDto } from '@pathway-up/dtos';

import { User } from '@/models/user.model';
import { CryptoService } from '@/modules/crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
    private cryptoService: CryptoService,
  ) {}

  async signUpUser(authUserDto: AuthUserDto) {
    const existingUser = await this.UserRepository.findOneBy({
      email: authUserDto.email,
    });

    if (existingUser)
      throw new BadRequestException('Invalid user data was provided !');

    const { email, password } = authUserDto;
    const confirmationHash = this.cryptoService.generateHash();

    const passwordHash = await this.cryptoService.hashPassword(password);

    const newUser = await this.UserRepository.create({
      email,
      passwordHash,
      confirmationHash,
      name: email.split('@')[0],
    });

    return this.UserRepository.save(newUser);
  }

  async confirmSignedUpUser(confirmationHash: string) {
    const userToBeConfirmed = await this.UserRepository.findOneBy({
      confirmationHash,
    });

    if (!userToBeConfirmed || userToBeConfirmed.isConfirmed)
      throw new BadRequestException('Invalid user data was provided !');

    userToBeConfirmed.isConfirmed = true;

    return this.UserRepository.save(userToBeConfirmed);
  }
}
