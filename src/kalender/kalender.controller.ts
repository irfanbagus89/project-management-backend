import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { KalenderService } from './kalender.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import * as TenantMiddleware from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class KalenderController {
  constructor(private readonly service: KalenderService) {}

  @Post('events')
  create(
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: CreateEventDto,
  ) {
    return this.service.create(req.user!.userId, dto);
  }

  @Get('events')
  list(
    @Query('orgId') orgId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.service.list(orgId, { from, to, projectId });
  }

  @Get('events/:id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('events/:id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.service.update(id, dto);
  }

  @Delete('events/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
