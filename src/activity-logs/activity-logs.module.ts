import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-logs.service';
import { ActivityLogController } from './activity-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityLogController],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
