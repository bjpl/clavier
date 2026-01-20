import { PrismaClient } from '@prisma/client';
import { seedPieces } from './seeds/pieces';
import { seedFeatures } from './seeds/features';
import { seedCurriculum } from './seeds/curriculum';
import { seedMeasures } from './seeds/measures';
import { seedNotes, seedPlaceholderNotes } from './seeds/notes';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Seed in dependency order
    await seedFeatures(prisma);
    console.log('');

    await seedPieces(prisma);
    console.log('');

    // Seed measures after pieces (measures reference pieces)
    await seedMeasures(prisma);
    console.log('');

    // Seed notes after measures (notes reference measures)
    await seedNotes(prisma);
    await seedPlaceholderNotes(prisma);
    console.log('');

    await seedCurriculum(prisma);
    console.log('');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
