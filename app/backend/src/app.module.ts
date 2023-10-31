import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { staticPath } from '@pathway-up/static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Env, loadAllConfigurations } from './configurations';
import { MODELS } from './models';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadAllConfigurations],
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
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
