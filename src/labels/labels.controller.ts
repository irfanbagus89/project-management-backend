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
import { LabelsService } from './labels.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { SetTaskLabelsDto } from './dto/set-task-label.dto';
import * as TenantRequest from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller()
export class LabelsController {
  constructor(private readonly service: LabelsService) {}

  // PROJECT LABELS
  @Get('projects/:projectId/labels')
  listProjectLabels(@Param('projectId') projectId: string) {
    return this.service.listProjectLabels(projectId);
  }

  @Post('projects/:projectId/labels')
  create(
    @Param('projectId') projectId: string,
    @Req() req: TenantRequest.TenantRequest,
    @Body() dto: CreateLabelDto,
  ) {
    return this.service.create(req.tenant!.orgId, {
      projectId,
      name: dto.name,
      color: dto.color,
    });
  }

  @Patch('labels/:id')
  update(@Param('id') id: string, @Body() dto: UpdateLabelDto) {
    return this.service.update(id, dto);
  }

  @Delete('labels/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // TASK <-> LABELS
  @Post('tasks/:taskId/labels:set')
  setTaskLabels(
    @Param('taskId') taskId: string,
    @Req() req: TenantRequest.TenantRequest,
    @Body() dto: SetTaskLabelsDto,
  ) {
    return this.service.setTaskLabels(req.tenant!.orgId, taskId, dto.labelIds);
  }
}
