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
import { SprintsService } from './sprints.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { ChangeStateDto } from './dto/change-state.dto';
import * as TenantMiddleware from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller('sprints')
export class SprintsController {
  constructor(private readonly service: SprintsService) {}

  @Post()
  create(
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: CreateSprintDto,
  ) {
    return this.service.create(req.tenant!.orgId, dto);
  }

  @Get('project/:projectId')
  list(@Param('projectId') projectId: string) {
    return this.service.list(projectId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSprintDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/state')
  changeState(@Param('id') id: string, @Body() dto: ChangeStateDto) {
    return this.service.changeState(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
