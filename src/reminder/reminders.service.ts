import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async create(requestorId: string, dto: CreateReminderDto) {
    // opsional: validasi requestor & user target berada di org yang sama
    const member = await this.prisma.orgMember.findFirst({
      where: { orgId: dto.orgId, userId: requestorId },
      select: { id: true },
    });
    if (!member) throw new ForbiddenException('Bukan anggota organisasi');

    return this.prisma.reminder.create({
      data: {
        orgId: dto.orgId,
        userId: dto.userId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        remindAt: new Date(dto.remindAt),
        channel: dto.channel,
      },
    });
  }

  async listForUser(orgId: string, userId: string) {
    return this.prisma.reminder.findMany({
      where: { orgId, userId },
      orderBy: { remindAt: 'asc' },
    });
  }

  async update(id: string, userId: string, dto: UpdateReminderDto) {
    const r = await this.prisma.reminder.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Reminder tidak ditemukan');
    if (r.userId !== userId)
      throw new ForbiddenException('Hanya pemilik reminder yang boleh edit');

    return this.prisma.reminder.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.remindAt ? { remindAt: new Date(dto.remindAt) } : {}),
      },
    });
  }

  async cancel(id: string, userId: string) {
    const r = await this.prisma.reminder.findUnique({ where: { id } });
    if (!r) throw new NotFoundException('Reminder tidak ditemukan');
    if (r.userId !== userId)
      throw new ForbiddenException(
        'Hanya pemilik reminder yang boleh membatalkan',
      );
    // Soft-cancel via sentAt timestamp (opsional: hapus saja)
    await this.prisma.reminder.delete({ where: { id } });
    return { message: 'Reminder dibatalkan' };
  }
}
