import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        orgId: dto.orgId,
        userId: dto.userId,
        type: dto.type,
        payload: dto.payload,
        isRead: dto.isRead ?? false,
      },
    });
  }

  async listForUser(orgId: string, userId: string) {
    return this.prisma.notification.findMany({
      where: { orgId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(orgId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { orgId, userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'Semua notifikasi ditandai sebagai dibaca' };
  }

  async remove(id: string) {
    await this.prisma.notification.delete({ where: { id } });
    return { message: 'Notifikasi dihapus' };
  }
}
