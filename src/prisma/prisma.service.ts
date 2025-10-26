import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') return;

    // Ambil semua properti yang merupakan model delegate
    const delegates = Object.entries(this).filter(
      ([, value]) =>
        typeof value === 'object' &&
        value !== null &&
        'deleteMany' in value &&
        typeof (value as { deleteMany?: unknown }).deleteMany === 'function',
    );

    for (const [, delegate] of delegates) {
      const model = delegate as { deleteMany: () => Promise<unknown> };
      await model.deleteMany();
    }
  }
}
