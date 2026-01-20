import { PrismaClient } from '@prisma/client';

/**
 * Parse time signature to get beat count per measure
 */
function getBeatCount(timeSignature: string): number {
  // Handle special cases
  if (timeSignature === 'C') return 4; // Common time = 4/4
  if (timeSignature === 'c') return 4;

  // Parse fraction format "n/d"
  const parts = timeSignature.split('/');
  if (parts.length !== 2) return 4; // Default to 4 beats

  const numerator = parseInt(parts[0], 10);
  const denominator = parseInt(parts[1], 10);

  // For compound meters (6/8, 9/8, 12/8), the feel is different
  // 6/8 = 2 beats (dotted quarter)
  // 9/8 = 3 beats
  // 12/8 = 4 beats
  // 12/16 = 4 beats
  if (denominator === 8 || denominator === 16) {
    if (numerator === 6) return 2;
    if (numerator === 9) return 3;
    if (numerator === 12) return 4;
  }

  // For simple meters, numerator is beat count
  return numerator;
}

export async function seedMeasures(prisma: PrismaClient) {
  console.log('Seeding measures for all pieces...');

  // Get all pieces from the database
  const pieces = await prisma.piece.findMany({
    select: {
      id: true,
      bwvNumber: true,
      type: true,
      totalMeasures: true,
      timeSignature: true,
    }
  });

  if (pieces.length === 0) {
    console.log('⚠ No pieces found in database. Run seedPieces first.');
    return;
  }

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const piece of pieces) {
    const beatCount = getBeatCount(piece.timeSignature);
    const totalMeasures = piece.totalMeasures;

    // Check if measures already exist for this piece
    const existingCount = await prisma.measure.count({
      where: { pieceId: piece.id }
    });

    if (existingCount > 0) {
      totalSkipped += existingCount;
      continue;
    }

    // Create measures in batches for efficiency
    const measuresToCreate = [];
    for (let i = 1; i <= totalMeasures; i++) {
      measuresToCreate.push({
        pieceId: piece.id,
        measureNumber: i,
        beatCount: beatCount,
        isPickup: false, // Could be enhanced later with actual pickup info
        isFinal: i === totalMeasures,
      });
    }

    // Batch create
    await prisma.measure.createMany({
      data: measuresToCreate,
      skipDuplicates: true,
    });

    totalCreated += measuresToCreate.length;
    console.log(`  ✓ BWV ${piece.bwvNumber} ${piece.type}: ${totalMeasures} measures`);
  }

  console.log(`✓ Created ${totalCreated} measures, skipped ${totalSkipped} existing`);
}
