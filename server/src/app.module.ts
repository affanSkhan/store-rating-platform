import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StoresModule } from './stores/stores.module';
import { RatingsModule } from './ratings/ratings.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),
        PORT: Joi.number().default(3000),
        CLIENT_URL: Joi.string().uri().default('http://localhost:5173'),
      }),
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    StoresModule,
    RatingsModule,
    AdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
