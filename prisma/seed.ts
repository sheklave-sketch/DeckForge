// Database seed script - Populate with core components
import { PrismaClient } from '@prisma/client';
import { SEED_COMPONENTS } from '../lib/components/seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing components (only CORE source)
  console.log('Clearing existing CORE components...');
  await prisma.component.deleteMany({
    where: { source: 'CORE' },
  });

  // Insert seed components
  console.log(`Inserting ${SEED_COMPONENTS.length} components...`);

  for (const component of SEED_COMPONENTS) {
    await prisma.component.create({
      data: {
        name: component.name,
        description: component.description,
        category: component.category,
        tags: component.tags,
        renderCode: component.renderCode,
        dataSchema: component.dataSchema as any,
        source: component.source,
        isPublic: component.isPublic,
        useCases: component.useCases,
        bestFor: component.bestFor,
        popularity: 0,
        createdBy: null, // System-created
      },
    });
    console.log(`  ✓ ${component.name} (${component.category})`);
  }

  console.log(`\n✅ Seeded ${SEED_COMPONENTS.length} components successfully!`);

  // Print summary by category
  const summary = await prisma.component.groupBy({
    by: ['category'],
    _count: true,
    where: { source: 'CORE' },
  });

  console.log('\nComponents by category:');
  summary.forEach((s) => {
    console.log(`  ${s.category}: ${s._count} components`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
