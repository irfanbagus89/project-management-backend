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
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import * as TenantMiddleware from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller('milestones')
export class MilestonesController {
  constructor(private readonly service: MilestonesService) {}

  @Post()
  create(
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: CreateMilestoneDto,
  ) {
    return this.service.create(req.tenant!.orgId, dto);
  }

  @Get('project/:projectId')
  list(@Param('projectId') projectId: string) {
    return this.service.list(projectId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
