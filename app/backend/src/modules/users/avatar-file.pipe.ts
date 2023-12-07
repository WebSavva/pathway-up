import { ParseFilePipe } from '@nestjs/common';
import {
  Injectable,
  Inject,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { filesConfig } from '@/configurations/files.config';

@Injectable()
export class AvatarFilePipe extends ParseFilePipe {
  constructor(
    @Inject(filesConfig.KEY) filesOptions: ConfigType<typeof filesConfig>,
  ) {
    const {
      avatar: { maxSizeMb, acceptedMimeTypes },
    } = filesOptions;
    super({
      validators: [
        new MaxFileSizeValidator({
          maxSize: maxSizeMb * 1e6,
        }),

        new FileTypeValidator({
          fileType: new RegExp(acceptedMimeTypes.split('/').join('|')),
        }),
      ],
    });
  }
}
