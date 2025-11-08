import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import * as TenantMiddleware from 'src/middleware/tenant.middleware';
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly service: AttachmentsService) {}

  @Post()
  upload(
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: UploadAttachmentDto,
  ) {
    return this.service.upload(dto.orgId, req.user!.userId, dto);
  }

  @Get('tasks/:taskId')
  listForTask(@Param('taskId') taskId: string) {
    return this.service.listForTask(taskId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
