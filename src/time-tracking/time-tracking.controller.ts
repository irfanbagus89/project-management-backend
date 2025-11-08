// src/time-tracking/time-tracking.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto';
import * as TenantMiddleware from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller('time-tracking')
export class TimeTrackingController {
  constructor(private readonly service: TimeTrackingService) {}

  @Post()
  create(
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: CreateTimeEntryDto,
  ) {
    return this.service.create(req.tenant!.orgId, req.user!.userId, dto);
  }

  @Get('tasks/:taskId')
  listForTask(@Param('taskId') taskId: string) {
    return this.service.listForTask(taskId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.service.update(id, req.user!.userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: TenantMiddleware.TenantRequest) {
    return this.service.remove(id, req.user!.userId);
  }
}
