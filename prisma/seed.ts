import { PrismaClient, user_role, user_status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      username: 'admin',
      role: user_role.ADMIN,
      status: user_status.ACTIVE,
      is_verified: true,
    },
  });

  // Create staff user
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      password: hashedPassword,
      username: 'staff',
      role: user_role.STAFF,
      status: user_status.ACTIVE,
      is_verified: true,
    },
  });

  // Create regular users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password: hashedPassword,
      username: 'user1',
      role: user_role.USER,
      status: user_status.ACTIVE,
      is_verified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      password: hashedPassword,
      username: 'user2',
      role: user_role.USER,
      status: user_status.ACTIVE,
      is_verified: false, // Unverified user
    },
  });

  // Create inactive user
  const inactiveUser = await prisma.user.upsert({
    where: { email: 'inactive@example.com' },
    update: {},
    create: {
      email: 'inactive@example.com',
      password: hashedPassword,
      username: 'inactive_user',
      role: user_role.USER,
      status: user_status.INACTIVE,
      is_verified: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created users:');
  console.log(`   - Admin: ${adminUser.email} (${adminUser.role})`);
  console.log(`   - Staff: ${staffUser.email} (${staffUser.role})`);
  console.log(`   - User1: ${user1.email} (${user1.role})`);
  console.log(`   - User2: ${user2.email} (${user2.role}) - Unverified`);
  console.log(`   - Inactive: ${inactiveUser.email} (${inactiveUser.status})`);
  console.log('');
  console.log('🔐 All passwords: password123');
  console.log('🔑 Admin login: admin@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
