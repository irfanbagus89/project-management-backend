import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // hanya properti yang ada di DTO
      forbidNonWhitelisted: true, // tolak properti asing
      transform: true, // ubah payload jadi instance DTO
    }),
  );

  app.use(cookieParser());
  app.useGlobalInterceptors(new ResponseInterceptor());
  // CORS setup
  app.enableCors({
    credentials: true,
  });

  app.setGlobalPrefix('api');
  const port = configService.port || 3000;

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Error starting the server:', err);
});
