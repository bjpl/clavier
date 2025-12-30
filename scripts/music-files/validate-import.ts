#!/usr/bin/env tsx
/**
 * Quality validation for MusicXML import
 *
 * Checks:
 * - All 48 pieces imported
 * - Measure counts reasonable
 * - Note relationships valid
 * - Generates import report
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { WTC_CATALOG, VALIDATION_RULES } from './music-files-config';

const prisma = new PrismaClient();

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: any;
}

interface ValidationReport {
  timestamp: string;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  pieceCount: number;
  measureCount: number;
  noteCount: number;
  validationResults: ValidationResult[];
  missingPieces: Array<{ bwv: number; type: string }>;
  pieceDetails: Array<{
    bwv: number;
    type: string;
    measures: number;
    notes: number;
    issues: string[];
  }>;
}

class ImportValidator {
  private report: ValidationReport = {
    timestamp: new Date().toISOString(),
    overallStatus: 'PASS',
    pieceCount: 0,
    measureCount: 0,
    noteCount: 0,
    validationResults: [],
    missingPieces: [],
    pieceDetails: [],
  };

  /**
   * Validate piece count
   */
  async validatePieceCount(): Promise<ValidationResult> {
    const pieceCount = await prisma.piece.count({
      where: {
        bwvNumber: {
          gte: 846,
          lte: 893,
        },
      },
    });

    this.report.pieceCount = pieceCount;

    const expected = 96; // 48 preludes + 48 fugues
    const passed = pieceCount === expected;

    return {
      passed,
      message: `Piece count: ${pieceCount} / ${expected}`,
      details: { pieceCount, expected },
    };
  }

  /**
   * Check for missing pieces
   */
  async checkMissingPieces(): Promise<ValidationResult> {
    const missing: Array<{ bwv: number; type: string }> = [];

    for (const catalogEntry of WTC_CATALOG) {
      if (catalogEntry.prelude) {
        const prelude = await prisma.piece.findFirst({
          where: {
            bwvNumber: catalogEntry.bwv,
            type: 'PRELUDE',
          },
        });

        if (!prelude) {
          missing.push({ bwv: catalogEntry.bwv, type: 'PRELUDE' });
        }
      }

      if (catalogEntry.fugue) {
        const fugue = await prisma.piece.findFirst({
          where: {
            bwvNumber: catalogEntry.bwv,
            type: 'FUGUE',
          },
        });

        if (!fugue) {
          missing.push({ bwv: catalogEntry.bwv, type: 'FUGUE' });
        }
      }
    }

    this.report.missingPieces = missing;

    return {
      passed: missing.length === 0,
      message: `Missing pieces: ${missing.length}`,
      details: missing,
    };
  }

  /**
   * Validate measure counts
   */
  async validateMeasureCounts(): Promise<ValidationResult> {
    const pieces = await prisma.piece.findMany({
      where: {
        bwvNumber: {
          gte: 846,
          lte: 893,
        },
      },
      include: {
        measures: true,
      },
    });

    const issues: string[] = [];

    for (const piece of pieces) {
      const measureCount = piece.measures.length;

      // Check against piece.totalMeasures
      if (measureCount !== piece.totalMeasures) {
        issues.push(
          `BWV ${piece.bwvNumber} ${piece.type}: measure count mismatch (${measureCount} vs ${piece.totalMeasures})`
        );
      }

      // Check measure count is reasonable
      const minMeasures = piece.type === 'PRELUDE'
        ? VALIDATION_RULES.minMeasuresPrelude
        : VALIDATION_RULES.minMeasuresFugue;

      if (measureCount < minMeasures) {
        issues.push(
          `BWV ${piece.bwvNumber} ${piece.type}: too few measures (${measureCount})`
        );
      }

      if (measureCount > VALIDATION_RULES.maxMeasures) {
        issues.push(
          `BWV ${piece.bwvNumber} ${piece.type}: too many measures (${measureCount})`
        );
      }
    }

    const totalMeasures = pieces.reduce((sum: number, p: any) => sum + p.measures.length, 0);
    this.report.measureCount = totalMeasures;

    return {
      passed: issues.length === 0,
      message: `Measure validation: ${issues.length} issues found`,
      details: issues,
    };
  }

  /**
   * Validate note relationships
   */
  async validateNoteRelationships(): Promise<ValidationResult> {
    const measures = await prisma.measure.findMany({
      where: {
        piece: {
          bwvNumber: {
            gte: 846,
            lte: 893,
          },
        },
      },
      include: {
        notes: true,
      },
    });

    const issues: string[] = [];
    let totalNotes = 0;

    for (const measure of measures) {
      totalNotes += measure.notes.length;

      // Check each note
      for (const note of measure.notes) {
        // Validate MIDI number range
        if (note.midiNumber < VALIDATION_RULES.validMidiRange.min ||
            note.midiNumber > VALIDATION_RULES.validMidiRange.max) {
          issues.push(
            `Measure ${measure.measureNumber}: Invalid MIDI number ${note.midiNumber}`
          );
        }

        // Validate octave range
        if (!VALIDATION_RULES.validOctaves.includes(note.octave)) {
          issues.push(
            `Measure ${measure.measureNumber}: Invalid octave ${note.octave}`
          );
        }

        // Validate start beat
        if (note.startBeat < 1) {
          issues.push(
            `Measure ${measure.measureNumber}: Invalid start beat ${note.startBeat}`
          );
        }

        // Validate duration
        if (note.durationBeats <= 0) {
          issues.push(
            `Measure ${measure.measureNumber}: Invalid duration ${note.durationBeats}`
          );
        }

        // Validate voice number
        if (note.voice < 1 || note.voice > 5) {
          issues.push(
            `Measure ${measure.measureNumber}: Invalid voice ${note.voice}`
          );
        }
      }

      // Check for overlapping notes in same voice
      const voiceGroups = new Map<number, typeof measure.notes>();
      for (const note of measure.notes) {
        if (!voiceGroups.has(note.voice)) {
          voiceGroups.set(note.voice, []);
        }
        voiceGroups.get(note.voice)!.push(note);
      }

      for (const [voice, notes] of voiceGroups) {
        const sortedNotes = notes.sort((a: any, b: any) => a.startBeat - b.startBeat);

        for (let i = 1; i < sortedNotes.length; i++) {
          const prev = sortedNotes[i - 1];
          const curr = sortedNotes[i];

          const prevEnd = prev.startBeat + prev.durationBeats;

          if (curr.startBeat < prevEnd) {
            // Allow small overlaps due to floating point precision
            const overlap = prevEnd - curr.startBeat;
            if (overlap > 0.01) {
              issues.push(
                `Measure ${measure.measureNumber}, voice ${voice}: Overlapping notes`
              );
            }
          }
        }
      }
    }

    this.report.noteCount = totalNotes;

    return {
      passed: issues.length === 0,
      message: `Note validation: ${issues.length} issues found (${totalNotes.toLocaleString()} notes checked)`,
      details: issues.slice(0, 20), // Limit to first 20 issues
    };
  }

  /**
   * Generate piece details
   */
  async generatePieceDetails(): Promise<void> {
    const pieces = await prisma.piece.findMany({
      where: {
        bwvNumber: {
          gte: 846,
          lte: 893,
        },
      },
      include: {
        measures: {
          include: {
            notes: true,
          },
        },
      },
      orderBy: [
        { bwvNumber: 'asc' },
        { type: 'asc' },
      ],
    });

    for (const piece of pieces) {
      const noteCount = piece.measures.reduce((sum: number, m: any) => sum + m.notes.length, 0);
      const issues: string[] = [];

      // Check for empty measures
      const emptyMeasures = piece.measures.filter((m: any) => m.notes.length === 0);
      if (emptyMeasures.length > 0) {
        issues.push(`${emptyMeasures.length} empty measures`);
      }

      // Check voice count consistency
      const voices = new Set<number>();
      for (const measure of piece.measures) {
        for (const note of measure.notes) {
          voices.add(note.voice);
        }
      }

      if (piece.voiceCount && voices.size !== piece.voiceCount) {
        issues.push(`Voice count mismatch: found ${voices.size}, expected ${piece.voiceCount}`);
      }

      this.report.pieceDetails.push({
        bwv: piece.bwvNumber,
        type: piece.type,
        measures: piece.measures.length,
        notes: noteCount,
        issues,
      });
    }
  }

  /**
   * Run all validations
   */
  async runValidation(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('MusicXML Import Validation');
    console.log('='.repeat(60));

    const validations = [
      { name: 'Piece Count', fn: () => this.validatePieceCount() },
      { name: 'Missing Pieces', fn: () => this.checkMissingPieces() },
      { name: 'Measure Counts', fn: () => this.validateMeasureCounts() },
      { name: 'Note Relationships', fn: () => this.validateNoteRelationships() },
    ];

    for (const validation of validations) {
      console.log(`\n→ ${validation.name}...`);
      const result = await validation.fn();
      this.report.validationResults.push(result);

      if (result.passed) {
        console.log(`  ✓ ${result.message}`);
      } else {
        console.log(`  ✗ ${result.message}`);
        this.report.overallStatus = 'FAIL';

        if (result.details && Array.isArray(result.details)) {
          const detailsToShow = result.details.slice(0, 5);
          for (const detail of detailsToShow) {
            console.log(`    - ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
          }
          if (result.details.length > 5) {
            console.log(`    ... and ${result.details.length - 5} more`);
          }
        }
      }
    }

    // Generate piece details
    console.log('\n→ Generating piece details...');
    await this.generatePieceDetails();
    console.log(`  ✓ Generated details for ${this.report.pieceDetails.length} pieces`);
  }

  /**
   * Print summary
   */
  printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('Validation Summary');
    console.log('='.repeat(60));

    const statusSymbol = this.report.overallStatus === 'PASS' ? '✓' : '✗';
    console.log(`\nOverall Status: ${statusSymbol} ${this.report.overallStatus}`);
    console.log(`\nStatistics:`);
    console.log(`  Pieces: ${this.report.pieceCount}`);
    console.log(`  Measures: ${this.report.measureCount.toLocaleString()}`);
    console.log(`  Notes: ${this.report.noteCount.toLocaleString()}`);

    const passedCount = this.report.validationResults.filter(r => r.passed).length;
    const totalChecks = this.report.validationResults.length;
    console.log(`\nValidation Checks: ${passedCount}/${totalChecks} passed`);

    if (this.report.missingPieces.length > 0) {
      console.log(`\n⚠ Missing Pieces (${this.report.missingPieces.length}):`);
      for (const missing of this.report.missingPieces.slice(0, 10)) {
        console.log(`  - BWV ${missing.bwv} ${missing.type}`);
      }
      if (this.report.missingPieces.length > 10) {
        console.log(`  ... and ${this.report.missingPieces.length - 10} more`);
      }
    }

    const piecesWithIssues = this.report.pieceDetails.filter(p => p.issues.length > 0);
    if (piecesWithIssues.length > 0) {
      console.log(`\n⚠ Pieces with Issues (${piecesWithIssues.length}):`);
      for (const piece of piecesWithIssues.slice(0, 5)) {
        console.log(`  - BWV ${piece.bwv} ${piece.type}: ${piece.issues.join(', ')}`);
      }
      if (piecesWithIssues.length > 5) {
        console.log(`  ... and ${piecesWithIssues.length - 5} more`);
      }
    }
  }

  /**
   * Save report to file
   */
  async saveReport(): Promise<void> {
    const reportDir = path.join(process.cwd(), 'scripts/music-files/reports');
    await fs.mkdir(reportDir, { recursive: true });

    const reportPath = path.join(reportDir, `validation-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(this.report, null, 2));

    console.log(`\n✓ Report saved to: ${reportPath}`);

    // Also save a human-readable markdown report
    const mdPath = path.join(reportDir, `validation-${Date.now()}.md`);
    await this.saveMarkdownReport(mdPath);
    console.log(`✓ Markdown report saved to: ${mdPath}`);
  }

  /**
   * Save markdown report
   */
  private async saveMarkdownReport(filePath: string): Promise<void> {
    let md = `# MusicXML Import Validation Report\n\n`;
    md += `**Generated:** ${this.report.timestamp}\n\n`;
    md += `**Status:** ${this.report.overallStatus}\n\n`;

    md += `## Summary\n\n`;
    md += `- **Pieces:** ${this.report.pieceCount}\n`;
    md += `- **Measures:** ${this.report.measureCount.toLocaleString()}\n`;
    md += `- **Notes:** ${this.report.noteCount.toLocaleString()}\n\n`;

    md += `## Validation Results\n\n`;
    for (const result of this.report.validationResults) {
      const icon = result.passed ? '✓' : '✗';
      md += `### ${icon} ${result.message}\n\n`;

      if (!result.passed && result.details) {
        if (Array.isArray(result.details) && result.details.length > 0) {
          md += `Issues:\n\n`;
          for (const detail of result.details.slice(0, 20)) {
            md += `- ${typeof detail === 'string' ? detail : JSON.stringify(detail)}\n`;
          }
          if (result.details.length > 20) {
            md += `\n... and ${result.details.length - 20} more issues\n`;
          }
          md += '\n';
        }
      }
    }

    if (this.report.missingPieces.length > 0) {
      md += `## Missing Pieces\n\n`;
      for (const missing of this.report.missingPieces) {
        md += `- BWV ${missing.bwv} ${missing.type}\n`;
      }
      md += '\n';
    }

    md += `## Piece Details\n\n`;
    md += `| BWV | Type | Measures | Notes | Issues |\n`;
    md += `|-----|------|----------|-------|--------|\n`;
    for (const piece of this.report.pieceDetails) {
      const issues = piece.issues.length > 0 ? piece.issues.join('; ') : '-';
      md += `| ${piece.bwv} | ${piece.type} | ${piece.measures} | ${piece.notes} | ${issues} |\n`;
    }

    await fs.writeFile(filePath, md);
  }
}

// Main execution
async function main() {
  const validator = new ImportValidator();

  try {
    await validator.runValidation();
    validator.printSummary();
    await validator.saveReport();

    const exitCode = validator['report'].overallStatus === 'PASS' ? 0 : 1;
    process.exit(exitCode);

  } catch (error) {
    console.error('\n✗ Validation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ImportValidator };
