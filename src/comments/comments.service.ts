// src/comments/comments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async listForTask(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        reactions: { select: { id: true, emoji: true, userId: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            reactions: { select: { id: true, emoji: true, userId: true } },
          },
        },
      },
    });
  }

  async create(orgId: string, authorId: string, data: CreateCommentDto) {
    // pastikan task ada & milik org yg sama (opsional ketat)
    const task = await this.prisma.task.findUnique({
      where: { id: data.taskId },
      select: { orgId: true },
    });
    if (!task) throw new NotFoundException('Task tidak ditemukan');
    if (task.orgId !== orgId)
      throw new ForbiddenException('Task bukan milik organisasi ini');

    return this.prisma.comment.create({
      data: {
        orgId,
        taskId: data.taskId,
        authorId,
        body: data.body,
        replyToId: data.replyToId ?? null,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  async update(commentId: string, userId: string, body: string) {
    const existing = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });
    if (!existing) throw new NotFoundException('Komentar tidak ditemukan');
    if (existing.authorId !== userId)
      throw new ForbiddenException('Hanya penulis yang boleh mengedit');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { body },
    });
  }

  async remove(commentId: string, userId: string) {
    const existing = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });
    if (!existing) throw new NotFoundException('Komentar tidak ditemukan');
    if (existing.authorId !== userId)
      throw new ForbiddenException('Hanya penulis yang boleh menghapus');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Komentar dihapus' };
  }

  // Reactions
  async addReaction(
    orgId: string,
    commentId: string,
    userId: string,
    emoji: string,
  ) {
    // idempotent via unique(commentId, userId, emoji) di schema
    return this.prisma.reaction.upsert({
      where: { commentId_userId_emoji: { commentId, userId, emoji } },
      update: {},
      create: { orgId, commentId, userId, emoji },
    });
  }

  async removeReaction(commentId: string, userId: string, emoji: string) {
    await this.prisma.reaction.delete({
      where: { commentId_userId_emoji: { commentId, userId, emoji } },
    });
    return { message: 'Reaction dihapus' };
  }
}
