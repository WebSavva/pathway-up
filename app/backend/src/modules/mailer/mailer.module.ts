import {
  Module,
  DynamicModule,
  FactoryProvider,
  ModuleMetadata,
} from '@nestjs/common';

import {
  MAIL_OPTIONS_INJECTION_KEY,
  type MailerOptionsFactoryProvider,
} from './mailer.service';

@Module({})
export class MailerModule {
  static forRoot({
    imports,
    useFactory,
    inject,
  }: MailerOptionsFactoryProvider): DynamicModule {
    return {
      module: MailerModule,
      imports: [...imports],
      providers: [
        {
          provide: MAIL_OPTIONS_INJECTION_KEY,
          useFactory,
          inject,
        },
      ],
    };
  }
}
