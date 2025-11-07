import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FilterProjectDto } from './dto/filter-project.dto';
import { Prisma, ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // Buat project baru di dalam organisasi
  async create(orgId: string, userId: string, data: CreateProjectDto) {
    const key =
      data.key ??
      data.name.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 10);

    const existing = await this.prisma.project.findFirst({
      where: { orgId, key },
    });

    if (existing)
      throw new Error('Key project sudah digunakan di organisasi ini');

    return this.prisma.project.create({
      data: {
        orgId,
        key,
        name: data.name,
        description: data.description,
        color: data.color,
        ownerId: userId,
        status: ProjectStatus.active,
      },
    });
  }

  // Ambil semua project milik organisasi
  async findAll(orgId: string, filter: FilterProjectDto) {
    const where: Prisma.ProjectWhereInput = {
      orgId,
      ...(filter.search
        ? {
            OR: [
              {
                name: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                key: {
                  contains: filter.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          }
        : {}),
      ...(filter.status ? { status: filter.status as ProjectStatus } : {}),
    };

    return this.prisma.project.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        key: true,
        color: true,
        status: true,
        createdAt: true,
      },
    });
  }

  // Ambil project by ID
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { org: { select: { id: true, name: true } } },
    });
    if (!project) throw new NotFoundException('Project tidak ditemukan');
    return project;
  }

  // Update project
  async update(id: string, data: UpdateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  // Hapus project
  async remove(id: string) {
    await this.prisma.project.delete({ where: { id } });
    return { message: 'Project berhasil dihapus' };
  }
}
