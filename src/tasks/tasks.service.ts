import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // Create task
  async create(orgId: string, reporterId: string, data: CreateTaskDto) {
    const workflowStatus = data.statusId
      ? await this.prisma.workflowStatus.findUnique({
          where: { id: data.statusId },
        })
      : await this.prisma.workflowStatus.findFirst({
          where: { orgId, name: 'To Do' },
        });

    if (!workflowStatus) throw new NotFoundException('Status tidak ditemukan');

    // ambil nomor urut task terakhir dalam project
    const lastTask = await this.prisma.task.findFirst({
      where: { projectId: data.projectId },
      orderBy: { number: 'desc' },
    });
    const nextNumber = (lastTask?.number ?? 0) + 1;

    return this.prisma.task.create({
      data: {
        orgId,
        projectId: data.projectId,
        number: nextNumber,
        title: data.title,
        description: data.description,
        reporterId,
        assigneeId: data.assigneeId,
        statusId: workflowStatus.id,
        priority: data.priority ?? 'med',
        type: data.type ?? 'task',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimateHours: data.estimateHours ?? null,
      },
    });
  }

  // Get all tasks per project
  async findAll(orgId: string, filter: FilterTaskDto) {
    const where: Prisma.TaskWhereInput = {
      orgId,
      ...(filter.projectId ? { projectId: filter.projectId } : {}),
      ...(filter.search
        ? {
            title: {
              contains: filter.search,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
    };

    return this.prisma.task.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true } },
        status: { select: { id: true, name: true } },
      },
    });
  }

  // Get detail task
  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        status: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });
    if (!task) throw new NotFoundException('Task tidak ditemukan');
    return task;
  }

  // Update task
  async update(id: string, data: UpdateTaskDto) {
    return this.prisma.task.update({ where: { id }, data });
  }

  // Delete task
  async remove(id: string) {
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task berhasil dihapus' };
  }
}
