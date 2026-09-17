import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const userHash = await bcrypt.hash('User@123', 12);
  const ownerHash = await bcrypt.hash('Owner@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ratinghub.local' },
    update: {},
    create: {
      name: 'Platform Operations Administrator',
      email: 'admin@ratinghub.local',
      passwordHash,
      address: 'Rating Hub HQ, Pune, Maharashtra',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@ratinghub.local' },
    update: {},
    create: {
      name: 'Everyday Customer Account Holder',
      email: 'user@ratinghub.local',
      passwordHash: userHash,
      address: 'Kothrud, Pune, Maharashtra',
      role: Role.USER,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@ratinghub.local' },
    update: {},
    create: {
      name: 'Independent Store Business Owner',
      email: 'owner@ratinghub.local',
      passwordHash: ownerHash,
      address: 'Viman Nagar, Pune, Maharashtra',
      role: Role.STORE_OWNER,
    },
  });

  const store = await prisma.store.upsert({
    where: { ownerId: owner.id },
    update: {},
    create: {
      name: 'Green Basket Neighborhood Market',
      email: 'hello@greenbasket.local',
      address: 'Viman Nagar Main Road, Pune, Maharashtra',
      ownerId: owner.id,
    },
  });

  const secondStore = await prisma.store.findFirst({ where: { email: 'support@dailyneeds.local' } });
  const dailyNeeds = secondStore ?? await prisma.store.create({
    data: {
      name: 'Daily Needs Family Superstore',
      email: 'support@dailyneeds.local',
      address: 'Baner Road, Pune, Maharashtra',
    },
  });

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: user.id, storeId: store.id } },
    update: { value: 4 },
    create: { userId: user.id, storeId: store.id, value: 4 },
  });

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: admin.id, storeId: dailyNeeds.id } },
    update: { value: 5 },
    create: { userId: admin.id, storeId: dailyNeeds.id, value: 5 },
  });

  console.log('Seed complete. Demo accounts:');
  console.log('admin@ratinghub.local / Admin@123');
  console.log('user@ratinghub.local / User@123');
  console.log('owner@ratinghub.local / Owner@123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
