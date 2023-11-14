import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { staticPath } from '@pathway-up/static';

import { envLoaders, Env } from './configurations';
import { MODELS } from './models';
import { AuthModule } from './modules/auth/auth.module';
import { DevModule } from './modules/dev/dev.module';
import { CookiesMiddleware } from './middlewares/cookies.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: envLoaders,
    }),
    ServeStaticModule.forRoot({
      rootPath: staticPath,
      serveRoot: '/static',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Env>) => {
        const dbConfig = configService.get('db', {
          infer: true,
        });

        const { database, user: username, password, port, host } = dbConfig;

        return {
          database,

          synchronize: configService.get('mode.isDev', {
            infer: true,
          }),

          type: 'postgres',

          username,

          password,

          port,

          host,

          entities: MODELS,
        };
      },
    }),
    DevModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookiesMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
