import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, dto: CreateMilestoneDto) {
    return this.prisma.milestone.create({
      data: {
        orgId,
        projectId: dto.projectId,
        name: dto.name,
        description: dto.description ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async list(projectId: string) {
    return this.prisma.milestone.findMany({
      where: { projectId },
      orderBy: { dueDate: 'asc' },
      include: {
        tasks: {
          select: { id: true, title: true, statusId: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateMilestoneDto) {
    const ms = await this.prisma.milestone.findUnique({ where: { id } });
    if (!ms) throw new NotFoundException('Milestone tidak ditemukan');
    return this.prisma.milestone.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.prisma.milestone.delete({ where: { id } });
    return { message: 'Milestone dihapus' };
  }
}
