import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import * as tenantMiddleware from 'src/middleware/tenant.middleware';
import { WorkflowsService } from './workflows/workflows.service';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly service: ProjectsService,
    private workflowsService: WorkflowsService,
  ) {}
  @Post()
  async create(
    @Req() req: tenantMiddleware.TenantRequest,
    @Body() dto: CreateProjectDto,
  ) {
    const result = await this.service.create(
      req.tenant!.orgId,
      req.user!.userId,
      dto,
    );
    await this.workflowsService.createDefaultWorkflow(
      req.tenant!.orgId,
      result.id,
    );
    return result;
  }

  @Get()
  findAll(
    @Req() req: tenantMiddleware.TenantRequest,
    @Query() query: FilterProjectDto,
  ) {
    return this.service.findAll(req.tenant!.orgId, query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
