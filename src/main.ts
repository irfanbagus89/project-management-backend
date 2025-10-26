import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hanya izinkan properti yang ada di DTO
      forbidNonWhitelisted: true, // Tolak properti asing
      transform: true, // Ubah payload jadi instance class DTO
    }),
  );

  const port = configService.port || 3000;
  app.setGlobalPrefix('api'); // semua endpoint diawali /api
  app.enableCors();

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('❌ Error starting the server:', err);
});
