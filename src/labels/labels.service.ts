import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabelsService {
  constructor(private prisma: PrismaService) {}

  async listProjectLabels(projectId: string) {
    return this.prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, color: true, createdAt: true },
    });
  }

  async create(
    orgId: string,
    data: { projectId: string; name: string; color?: string },
  ) {
    // validasi project milik org
    const project = await this.prisma.project.findUnique({
      where: { id: data.projectId },
      select: { orgId: true },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    if (project.orgId !== orgId)
      throw new ForbiddenException('Project bukan milik organisasi ini');

    return this.prisma.label.create({
      data: {
        orgId,
        projectId: data.projectId,
        name: data.name,
        color: data.color,
      },
    });
  }

  async update(labelId: string, data: { name?: string; color?: string }) {
    return this.prisma.label.update({ where: { id: labelId }, data });
  }

  async remove(labelId: string) {
    await this.prisma.label.delete({ where: { id: labelId } });
    return { message: 'Label dihapus' };
  }

  // Set labels to a task
  async setTaskLabels(orgId: string, taskId: string, labelIds: string[]) {
    // validasi task + label 1 organisasi (opsional ketat)
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { orgId: true, projectId: true },
    });
    if (!task) throw new NotFoundException('Task tidak ditemukan');
    if (task.orgId !== orgId)
      throw new ForbiddenException('Task bukan milik organisasi ini');

    // cek semua label belongs to same project (opsional)
    const labels = await this.prisma.label.findMany({
      where: { id: { in: labelIds }, projectId: task.projectId },
      select: { id: true },
    });
    if (labels.length !== labelIds.length)
      throw new ForbiddenException('Terdapat label tidak sesuai project');

    // reset lalu set
    await this.prisma.taskLabel.deleteMany({ where: { taskId } });
    if (labelIds.length) {
      await this.prisma.taskLabel.createMany({
        data: labelIds.map((labelId) => ({ taskId, labelId })),
        skipDuplicates: true,
      });
    }
    return { message: 'Labels tersimpan' };
  }
}
