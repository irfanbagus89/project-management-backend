import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeEntryDto } from './dto/create-time-entry.dto';

@Injectable()
export class TimeTrackingService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, userId: string, dto: CreateTimeEntryDto) {
    return this.prisma.timeEntry.create({
      data: {
        orgId,
        taskId: dto.taskId,
        userId,
        date: new Date(dto.date),
        minutes: dto.minutes,
        note: dto.note,
      },
    });
  }

  async listForTask(taskId: string) {
    return this.prisma.timeEntry.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: { minutes?: number; note?: string },
  ) {
    const entry = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Entri waktu tidak ditemukan');
    if (entry.userId !== userId)
      throw new NotFoundException('Hanya pemilik entri yang boleh edit');

    return this.prisma.timeEntry.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const entry = await this.prisma.timeEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Entri waktu tidak ditemukan');
    if (entry.userId !== userId)
      throw new NotFoundException('Hanya pemilik entri yang boleh hapus');
    await this.prisma.timeEntry.delete({ where: { id } });
    return { message: 'Time entry dihapus' };
  }
}
