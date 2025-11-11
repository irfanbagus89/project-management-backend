import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) {}

  async record(dto: CreateActivityDto) {
    return this.prisma.activityLog.create({
      data: {
        orgId: dto.orgId,
        actorId: dto.actorId,
        entityType: dto.entityType,
        entityId: dto.entityId,
        action: dto.action,
        before: dto.before,
        after: dto.after,
      },
    });
  }

  async list(
    orgId: string,
    params?: { entityType?: string; entityId?: string },
  ) {
    return this.prisma.activityLog.findMany({
      where: {
        orgId,
        ...(params?.entityType ? { entityType: params.entityType } : {}),
        ...(params?.entityId ? { entityId: params.entityId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.activityLog.findUnique({
      where: { id },
      include: { actor: { select: { id: true, name: true } } },
    });
  }

  async clear(orgId: string) {
    await this.prisma.activityLog.deleteMany({ where: { orgId } });
    return { message: 'Activity log dibersihkan' };
  }
}
