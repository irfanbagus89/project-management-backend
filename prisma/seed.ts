import { PrismaClient, Role, Permission } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // --- STEP 1: Seed Global Permissions
  const permissionsData: Omit<Permission, 'id'>[] = [
    { code: 'org.manage', description: 'Manage organization settings' },
    { code: 'user.invite', description: 'Invite new members' },
    { code: 'project.create', description: 'Create new projects' },
    { code: 'project.edit', description: 'Edit project details' },
    { code: 'task.create', description: 'Create tasks' },
    { code: 'task.edit', description: 'Edit tasks' },
    { code: 'task.comment', description: 'Comment on tasks' },
  ];

  await Promise.all(
    permissionsData.map((p) =>
      prisma.permission.upsert({
        where: { code: p.code },
        update: {},
        create: p,
      }),
    ),
  );

  console.log(`✅ Seeded ${permissionsData.length} permissions.`);

  // --- STEP 2: Organization default
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
      plan: 'free',
    },
  });

  console.log(`🏢 Organization created: ${org.name}`);

  // --- STEP 3: Roles default per org
  const rolesData = [
    {
      name: 'Owner',
      scope: 'org',
      description: 'Full access to all resources',
    },
    { name: 'Admin', scope: 'org', description: 'Manage users and projects' },
    {
      name: 'Member',
      scope: 'org',
      description: 'Basic access to assigned tasks',
    },
  ];

  const roleRecords: Role[] = await Promise.all(
    rolesData.map((role) =>
      prisma.role.upsert({
        where: { orgId_name: { orgId: org.id, name: role.name } },
        update: {},
        create: { ...role, orgId: org.id },
      }),
    ),
  );

  console.log(`👥 Roles created: ${roleRecords.map((r) => r.name).join(', ')}`);

  // --- STEP 4: Assign RolePermissions
  const allPermissions: Permission[] = await prisma.permission.findMany();

  const ownerRole = roleRecords.find((r) => r.name === 'Owner');
  const adminRole = roleRecords.find((r) => r.name === 'Admin');
  const memberRole = roleRecords.find((r) => r.name === 'Member');

  if (!ownerRole || !adminRole || !memberRole)
    throw new Error('Missing one or more default roles.');

  // Owner → semua permission
  const ownerPerms = allPermissions.map((p) => ({
    orgId: org.id,
    roleId: ownerRole.id,
    permissionId: p.id,
  }));

  // Admin → semua kecuali permission org-level
  const adminPerms = allPermissions
    .filter((p) => !p.code.startsWith('org.'))
    .map((p) => ({
      orgId: org.id,
      roleId: adminRole.id,
      permissionId: p.id,
    }));

  // Member → hanya task-related
  const memberPerms = allPermissions
    .filter((p) => p.code.startsWith('task.'))
    .map((p) => ({
      orgId: org.id,
      roleId: memberRole.id,
      permissionId: p.id,
    }));

  await prisma.rolePermission.createMany({
    data: [...ownerPerms, ...adminPerms, ...memberPerms],
    skipDuplicates: true,
  });

  console.log(
    `🔐 RolePermissions assigned:
    - Owner: ${ownerPerms.length}
    - Admin: ${adminPerms.length}
    - Member: ${memberPerms.length}`,
  );

  // --- STEP 5: Optional admin user seed
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Super Admin',
      passwordHash:
        '$2b$10$X8ZQG6jKQqzNViqUu9K6leuwZSY.3.qm/XqR2hiFu7lTg2E4BOl5K', // bcrypt('123456')
    },
  });

  // Tambahkan admin user sebagai member di org
  await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: org.id, userId: adminUser.id } },
    update: {},
    create: {
      orgId: org.id,
      userId: adminUser.id,
      roleId: ownerRole.id,
      status: 'active',
    },
  });

  console.log(`👑 Admin user created: ${adminUser.email}`);
  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
