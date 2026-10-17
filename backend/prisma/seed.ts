import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // ----- Demo (regular) user -----
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@nova-analytics.local' },
    update: { role: 'USER' },
    create: {
      email: 'demo@nova-analytics.local',
      name: 'Demo User',
      passwordHash,
      role: 'USER',
      emailVerified: new Date(),
    },
  });

  // ----- Admin user -----
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@nova-analytics.local' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@nova-analytics.local',
      name: 'Admin',
      passwordHash,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  // ----- Viewer user -----
  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@nova-analytics.local' },
    update: { role: 'VIEWER' },
    create: {
      email: 'viewer@nova-analytics.local',
      name: 'Viewer',
      passwordHash,
      role: 'VIEWER',
      emailVerified: new Date(),
    },
  });

  // ----- Demo site (belongs to demo user) -----
  const demoSite = await prisma.site.upsert({
    where: { trackingKey: 'demo-tracking-key-001' },
    update: {},
    create: {
      name: 'Demo Site',
      domain: 'demo.example.com',
      trackingKey: 'demo-tracking-key-001',
      userId: demoUser.id,
    },
  });

  // ----- Admin site (belongs to admin user) -----   ← NEW
  const adminSite = await prisma.site.upsert({
    where: { trackingKey: 'admin-tracking-key-001' },
    update: {},
    create: {
      name: 'Admin Site',
      domain: 'admin.example.com',
      trackingKey: 'admin-tracking-key-001',
      userId: adminUser.id,
    },
  });

  // ----- Viewer site (belongs to viewer user) -----   ← optional, same pattern
  const viewerSite = await prisma.site.upsert({
    where: { trackingKey: 'viewer-tracking-key-001' },
    update: {},
    create: {
      name: 'Viewer Site',
      domain: 'viewer.example.com',
      trackingKey: 'viewer-tracking-key-001',
      userId: viewerUser.id,
    },
  });

  console.log('✅ Seed complete:');
  console.log('');
  console.log('   Regular user:');
  console.log(`     Email:    ${demoUser.email}`);
  console.log(`     Password: password123`);
  console.log(`     Site:     ${demoSite.name} (${demoSite.domain})`);
  console.log('');
  console.log('   Admin user:');
  console.log(`     Email:    ${adminUser.email}`);
  console.log(`     Password: password123`);
  console.log(`     Site:     ${adminSite.name} (${adminSite.domain})`);
  console.log('');
  console.log('   Viewer user:');
  console.log(`     Email:    ${viewerUser.email}`);
  console.log(`     Password: password123`);
  console.log(`     Site:     ${viewerSite.name} (${viewerSite.domain})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });