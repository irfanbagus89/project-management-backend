import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ActivityLogService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateActivityDto } from './dto/create-activity.dto';
import * as TenantMiddleware from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller('activity')
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) {}

  @Post()
  record(
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: CreateActivityDto,
  ) {
    return this.service.record({ ...dto, actorId: req.user!.userId });
  }

  @Get()
  list(
    @Query('orgId') orgId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.service.list(orgId, { entityType, entityId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete('clear')
  clear(@Query('orgId') orgId: string) {
    return this.service.clear(orgId);
  }
}
