import { PrismaService } from '../../prisma/prisma.service';

export async function slugifyUnique(
  prisma: PrismaService,
  name: string,
): Promise<string> {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  let slug = base;
  let counter = 1;

  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${counter++}`;
  }

  return slug;
}
