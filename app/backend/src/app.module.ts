import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (envService: ConfigService<Env>) => {
        return {
          database: envService.get('db.database', {
            infer: true,
          }),

          synchronize: true,

          type: 'postgres',

          username: envService.get('db.user', {
            infer: true,
          }),

          password: envService.get('db.password', {
            infer: true,
          }),

          port: envService.get('db.port', {
            infer: true,
          }),

          host: envService.get('db.host', {
            infer: true,
          }),

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
