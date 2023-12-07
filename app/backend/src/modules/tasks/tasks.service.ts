import { Injectable } from '@nestjs/common';

import { UsersService } from '@/modules/users/users.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  constructor(private usersService: UsersService) {}

  @Interval(5 * 60 * 1e3)
  async deleteStaleAvatars() {
    const allStaleAvatars = await this.usersService.getAllStaleAvatars();

    await Promise.allSettled(
      allStaleAvatars.map((staleAvatar) =>
        this.usersService.deleteUserAvatar(staleAvatar),
      ),
    );
  }
}
