import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  forwardRef
} from '@nestjs/common';
import { GROUPS } from '@/constants';

import { AuthGuard } from '@/modules/auth/auth.guard';

import { UsersService } from './users.service';
import { CurrentUser } from '@/decorators/user.decorator';
import { User } from '@/models/user.model';
import { SerializerService } from '../serializer/serializer.service';

@Controller('users')
export class UsersController {
  constructor(
    private serializerService: SerializerService,
    private usersService: UsersService,
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

    return this.serializerService.serializeByGroups(user, [GROUPS.Self]);
  }
}
