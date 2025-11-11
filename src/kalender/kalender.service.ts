import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class KalenderService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    if (dto.projectId) {
      const proj = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { orgId: true },
      });
      if (!proj) throw new NotFoundException('Project tidak ditemukan');
      if (proj.orgId !== dto.orgId)
        throw new ForbiddenException('Project bukan milik organisasi');
    }

    return this.prisma.event.create({
      data: {
        orgId: dto.orgId,
        projectId: dto.projectId ?? null,
        title: dto.title,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        allDay: !!dto.allDay,
        location: dto.location ?? null,
        source: dto.source ?? 'internal',
        externalId: dto.externalId ?? null,
        createdById: userId,
      },
    });
  }

  async list(
    orgId: string,
    params: { from?: string; to?: string; projectId?: string },
  ) {
    const where: Prisma.EventWhereInput = {
      orgId,
      ...(params.projectId ? { projectId: params.projectId } : {}),
      ...(params.from || params.to
        ? {
            AND: [
              params.from ? { endAt: { gte: new Date(params.from) } } : {},
              params.to ? { startAt: { lte: new Date(params.to) } } : {},
            ],
          }
        : {}),
    };

    return this.prisma.event.findMany({
      where,
      orderBy: { startAt: 'asc' },
      include: { project: { select: { id: true, name: true, key: true } } },
    });
  }

  async findOne(id: string) {
    const ev = await this.prisma.event.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!ev) throw new NotFoundException('Event tidak ditemukan');
    return ev;
  }

  async update(id: string, dto: UpdateEventDto) {
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startAt ? { startAt: new Date(dto.startAt) } : {}),
        ...(dto.endAt ? { endAt: new Date(dto.endAt) } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event dihapus' };
  }
}
