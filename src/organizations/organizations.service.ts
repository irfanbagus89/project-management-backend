import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { slugifyUnique } from 'src/common/utils/slug.utils';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  // Membuat organisasi baru
  async create(userId: string, data: CreateOrganizationDto) {
    const slug = data.slug ?? (await slugifyUnique(this.prisma, data.name));

    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (existing) throw new BadRequestException('Slug sudah digunakan');

    const result = await this.prisma.$transaction(async (tx) => {
      // Buat Organization
      const org = await tx.organization.create({
        data: {
          name: data.name,
          slug,
          logoUrl: data.logoUrl,
        },
      });

      // Buat Role Owner di organisasi ini
      const ownerRole = await tx.role.create({
        data: {
          orgId: org.id,
          name: 'Owner',
          scope: 'org',
          description: 'Full access to all resources',
        },
      });

      // Tambahkan user pembuat sebagai anggota Owner
      await tx.orgMember.create({
        data: {
          orgId: org.id,
          userId,
          roleId: ownerRole.id,
          status: 'active',
        },
      });

      const result = await tx.organization.findUnique({
        where: { id: org.id },
        select: {
          name: true,
          logoUrl: true,
          plan: true,
          timezone: true,
        },
      });
      return result;
    });

    return result;
  }

  // Menampilkan organisasi milik user
  async findAllByUser(userId: string) {
    return this.prisma.organization.findMany({
      where: {
        members: { some: { userId } },
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        plan: true,
        timezone: true,
      },
    });
  }

  // Update info organisasi
  async update(orgId: string, data: UpdateOrganizationDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) throw new NotFoundException('Organisasi tidak ditemukan');

    await this.prisma.organization.update({
      where: { id: orgId },
      data,
    });

    const result = await this.prisma.organization.findUnique({
      where: { id: org.id },
      select: {
        name: true,
        logoUrl: true,
        plan: true,
        timezone: true,
      },
    });
    return result;
  }

  // Invite anggota baru
  async inviteMember(orgId: string, data: InviteMemberDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user)
      throw new NotFoundException('User dengan email tersebut tidak ditemukan');

    const existingMember = await this.prisma.orgMember.findFirst({
      where: { orgId, userId: user.id },
    });
    if (existingMember)
      throw new BadRequestException('User sudah menjadi anggota');

    return this.prisma.orgMember.create({
      data: {
        orgId,
        userId: user.id,
        status: 'invited',
        roleId: data.roleId,
      },
    });
  }
}
