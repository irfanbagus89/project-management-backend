import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import * as TenantMiddleware from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller('reminders')
export class RemindersController {
  constructor(private readonly service: RemindersService) {}

  @Post()
  create(
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: CreateReminderDto,
  ) {
    return this.service.create(req.user!.userId, dto);
  }

  @Get()
  listForMe(
    @Query('orgId') orgId: string,
    @Req() req: TenantMiddleware.TenantRequest,
  ) {
    return this.service.listForUser(orgId, req.user!.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.service.update(id, req.user!.userId, dto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @Req() req: TenantMiddleware.TenantRequest) {
    return this.service.cancel(id, req.user!.userId);
  }
}
