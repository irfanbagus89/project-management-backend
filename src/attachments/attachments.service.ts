import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';

@Injectable()
export class AttachmentsService {
  constructor(private prisma: PrismaService) {}

  async upload(orgId: string, userId: string, data: UploadAttachmentDto) {
    return this.prisma.attachment.create({
      data: {
        orgId,
        projectId: data.projectId,
        taskId: data.taskId,
        uploaderId: userId,
        filename: data.filename,
        mime: data.mime,
        size: data.size,
        storageKey: data.storageKey,
      },
    });
  }

  async listForTask(taskId: string) {
    return this.prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        mime: true,
        size: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    const file = await this.prisma.attachment.findUnique({ where: { id } });
    if (!file) throw new NotFoundException('Attachment tidak ditemukan');
    await this.prisma.attachment.delete({ where: { id } });
    return { message: 'Attachment dihapus' };
  }
}
