import { Module } from '@nestjs/common';
import { KalenderService } from './kalender.service';
import { KalenderController } from './kalender.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KalenderController],
  providers: [KalenderService],
  exports: [KalenderService],
})
export class KalenderModule {}
