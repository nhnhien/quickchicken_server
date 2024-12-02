import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function initData() {
  const roles = [{ name: 'owner' }, { name: 'customer' }];

  const upsertPromises = roles.map((role) => {
    return prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  });

  try {
    await Promise.all(upsertPromises);
    console.log('Roles have been initialized successfully.');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
}
initData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
