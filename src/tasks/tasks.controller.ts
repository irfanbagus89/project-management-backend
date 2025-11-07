import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import * as tenantMiddleware from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Post()
  create(
    @Req() req: tenantMiddleware.TenantRequest,
    @Body() dto: CreateTaskDto,
  ) {
    return this.service.create(req.tenant!.orgId, req.user!.userId, dto);
  }

  @Get()
  findAll(
    @Req() req: tenantMiddleware.TenantRequest,
    @Query() query: FilterTaskDto,
  ) {
    return this.service.findAll(req.tenant!.orgId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
