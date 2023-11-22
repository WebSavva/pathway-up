import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
  Patch,
  Body,
} from '@nestjs/common';
import { GROUPS } from '@pathway-up/constants';
import { UserPartialDto, UserPartialDtoSchema } from '@pathway-up/dtos';

import { AuthGuard } from '@/modules/auth/auth.guard';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { User } from '@/models/user.model';
import { CurrentUser } from '@/decorators/user.decorator';
import { SerializerService } from '@/modules/serializer/serializer.service';

import { UsersService } from './users.service';

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

    return this.serializerService.serializeByGroups(user);
  }

  @UseGuards(AuthGuard)
  @Patch('/me')
  async patchMe(
    @Body(new ValidationPipe(UserPartialDtoSchema)) partialUpdatedUser: UserPartialDto,
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
}
