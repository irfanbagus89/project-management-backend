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
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ReactionDto } from './dto/reaction.dto';
import * as TenantMiddleware from 'src/middleware/tenant.middleware';

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  // List komentar pada task
  @Get('tasks/:taskId/comments')
  list(@Param('taskId') taskId: string) {
    return this.service.listForTask(taskId);
  }

  // Buat komentar / reply
  @Post('tasks/:taskId/comments')
  create(
    @Param('taskId') taskId: string,
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: CreateCommentDto,
  ) {
    return this.service.create(req.tenant!.orgId, req.user!.userId, dto);
  }

  @Patch('comments/:id')
  update(
    @Param('id') id: string,
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.service.update(id, req.user!.userId, dto.body);
  }

  @Delete('comments/:id')
  remove(@Param('id') id: string, @Req() req: TenantMiddleware.TenantRequest) {
    return this.service.remove(id, req.user!.userId);
  }

  // Reactions
  @Post('comments/:id/reactions')
  addReaction(
    @Param('id') id: string,
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: ReactionDto,
  ) {
    return this.service.addReaction(
      req.tenant!.orgId,
      id,
      req.tenant!.orgId,
      dto.emoji,
    );
  }

  @Delete('comments/:id/reactions')
  removeReaction(
    @Param('id') id: string,
    @Req() req: TenantMiddleware.TenantRequest,
    @Body() dto: ReactionDto,
  ) {
    return this.service.removeReaction(id, req.user!.userId, dto.emoji);
  }
}
