// Test database connection
const fs = require('fs');
const path = require('path');

// Manually load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !match[1].startsWith('#')) {
    process.env[match[1]] = match[2];
  }
});

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`;
    console.log('✅ Connection successful!');
    console.log('Result:', result);

    // Test user table
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
