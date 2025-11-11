// src/sprints/sprints.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { ChangeStateDto } from './dto/change-state.dto';

@Injectable()
export class SprintsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateSprintDto) {
    return this.prisma.sprint.create({
      data: {
        orgId,
        projectId: dto.projectId,
        name: dto.name,
        goal: dto.goal ?? null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  async list(projectId: string) {
    return this.prisma.sprint.findMany({
      where: { projectId },
      orderBy: { startDate: 'asc' },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            statusId: true,
            assignee: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateSprintDto) {
    return this.prisma.sprint.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
      },
    });
  }

  async changeState(id: string, dto: ChangeStateDto) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id } });
    if (!sprint) throw new NotFoundException('Sprint tidak ditemukan');
    return this.prisma.sprint.update({
      where: { id },
      data: { state: dto.state },
    });
  }

  async remove(id: string) {
    await this.prisma.sprint.delete({ where: { id } });
    return { message: 'Sprint dihapus' };
  }
}
