import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaService } from './common/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const prisma = app.get(PrismaService);

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.enableCors({
    origin: config.get<string>('CLIENT_URL', 'http://localhost:5173'),
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await prisma.enableShutdownHooks(app);
  await app.listen(config.get<number>('PORT', 3000));
}

bootstrap();
