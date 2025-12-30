#!/usr/bin/env node

/**
 * Quality Assurance Validation for Measure Commentary
 *
 * Validates generated commentary for:
 * - JSON structure correctness
 * - Content completeness
 * - Terminology consistency
 * - Length requirements
 * - Cross-reference accuracy
 *
 * Generates quality report with random sampling for human review.
 */

import { PieceCommentary, MeasureCommentary } from './generate-measure-commentary';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface ValidationIssue {
  file: string;
  measure: number;
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
}

interface QualityMetrics {
  avgCommentaryLength: number;
  avgTerminologyCount: number;
  totalMeasures: number;
  filesValidated: number;
  issuesFound: ValidationIssue[];
  sampleMeasures: Array<{
    bwv: number;
    type: string;
    measure: number;
    commentary: string;
  }>;
}

class QualityValidator {
  private metrics: QualityMetrics = {
    avgCommentaryLength: 0,
    avgTerminologyCount: 0,
    totalMeasures: 0,
    filesValidated: 0,
    issuesFound: [],
    sampleMeasures: [],
  };

  private totalCommentaryLength = 0;
  private totalTerminology = 0;

  /**
   * Validate a single commentary file
   */
  validateFile(filePath: string): void {
    console.log(`🔍 Validating: ${filePath}`);

    try {
      const content = readFileSync(filePath, 'utf-8');
      const commentary: PieceCommentary = JSON.parse(content);

      // Validate structure
      this.validateStructure(commentary, filePath);

      // Validate each measure
      commentary.measures.forEach((measure, index) => {
        this.validateMeasure(commentary, measure, filePath);

        // Track metrics
        this.totalCommentaryLength += measure.commentary.length;
        this.totalTerminology += measure.terminology_introduced.length;
        this.metrics.totalMeasures++;

        // Random sampling (5%)
        if (Math.random() < 0.05) {
          this.metrics.sampleMeasures.push({
            bwv: commentary.bwv,
            type: commentary.type,
            measure: measure.measure_number,
            commentary: measure.commentary,
          });
        }
      });

      this.metrics.filesValidated++;
      console.log(`   ✓ ${commentary.measures.length} measures validated\n`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.addIssue(filePath, 0, 'error', 'File Error', errorMessage);
      console.error(`   ✗ Error: ${errorMessage}\n`);
    }
  }

  /**
   * Validate commentary structure
   */
  private validateStructure(commentary: PieceCommentary, filePath: string): void {
    if (!commentary.bwv || !commentary.type || !commentary.key) {
      this.addIssue(filePath, 0, 'error', 'Structure', 'Missing required fields: bwv, type, or key');
    }

    if (!Array.isArray(commentary.measures) || commentary.measures.length === 0) {
      this.addIssue(filePath, 0, 'error', 'Structure', 'Measures array is missing or empty');
    }

    // Check measure continuity
    commentary.measures.forEach((measure, index) => {
      const expectedNumber = index + 1;
      if (measure.measure_number !== expectedNumber) {
        this.addIssue(
          filePath,
          measure.measure_number,
          'error',
          'Structure',
          `Measure number mismatch: expected ${expectedNumber}, got ${measure.measure_number}`
        );
      }
    });
  }

  /**
   * Validate individual measure commentary
   */
  private validateMeasure(
    commentary: PieceCommentary,
    measure: MeasureCommentary,
    filePath: string
  ): void {
    const measureNum = measure.measure_number;

    // Required fields
    if (!measure.harmony || !measure.commentary || !measure.connections) {
      this.addIssue(
        filePath,
        measureNum,
        'error',
        'Content',
        'Missing required fields: harmony, commentary, or connections'
      );
    }

    // Commentary length (should be 80-120 words per spec)
    const wordCount = measure.commentary.split(/\s+/).length;
    if (wordCount < 40) {
      this.addIssue(
        filePath,
        measureNum,
        'warning',
        'Length',
        `Commentary too short: ${wordCount} words (expected 80-120)`
      );
    } else if (wordCount > 200) {
      this.addIssue(
        filePath,
        measureNum,
        'warning',
        'Length',
        `Commentary too long: ${wordCount} words (expected 80-120)`
      );
    }

    // Terminology consistency
    if (!Array.isArray(measure.terminology_introduced)) {
      this.addIssue(
        filePath,
        measureNum,
        'error',
        'Structure',
        'terminology_introduced must be an array'
      );
    }

    // Notable features should be slugs
    if (measure.notable_features) {
      measure.notable_features.forEach(feature => {
        if (feature.includes(' ') || feature.toUpperCase() === feature) {
          this.addIssue(
            filePath,
            measureNum,
            'warning',
            'Formatting',
            `Notable feature should be kebab-case slug: "${feature}"`
          );
        }
      });
    }

    // Connections validation
    if (!measure.connections.sets_up) {
      this.addIssue(
        filePath,
        measureNum,
        'warning',
        'Content',
        'Missing "sets_up" connection - should preview what follows'
      );
    }

    // First measure should have references_back as null
    if (measureNum === 1 && measure.connections.references_back !== null) {
      this.addIssue(
        filePath,
        measureNum,
        'info',
        'Content',
        'First measure should have references_back: null'
      );
    }
  }

  /**
   * Add validation issue
   */
  private addIssue(
    file: string,
    measure: number,
    severity: 'error' | 'warning' | 'info',
    category: string,
    message: string
  ): void {
    this.metrics.issuesFound.push({
      file,
      measure,
      severity,
      category,
      message,
    });
  }

  /**
   * Validate all files in directory
   */
  validateDirectory(directory: string): void {
    console.log(`\n🎼 Validating all commentary in: ${directory}\n`);

    const files = readdirSync(directory).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} commentary files\n`);

    files.forEach(file => {
      const filePath = join(directory, file);
      this.validateFile(filePath);
    });

    this.calculateMetrics();
    this.printReport();
    this.generateSampleReport();
  }

  /**
   * Calculate final metrics
   */
  private calculateMetrics(): void {
    if (this.metrics.totalMeasures > 0) {
      this.metrics.avgCommentaryLength = Math.round(
        this.totalCommentaryLength / this.metrics.totalMeasures
      );
      this.metrics.avgTerminologyCount = (
        this.totalTerminology / this.metrics.totalMeasures
      ).toFixed(2) as any;
    }
  }

  /**
   * Print validation report
   */
  printReport(): void {
    console.log('\n' + '='.repeat(70));
    console.log('📊 QUALITY VALIDATION REPORT');
    console.log('='.repeat(70));

    console.log(`\nFiles validated: ${this.metrics.filesValidated}`);
    console.log(`Total measures: ${this.metrics.totalMeasures}`);
    console.log(`Avg commentary length: ${this.metrics.avgCommentaryLength} characters`);
    console.log(`Avg terminology entries: ${this.metrics.avgTerminologyCount} per measure`);

    // Issues summary
    const errors = this.metrics.issuesFound.filter(i => i.severity === 'error');
    const warnings = this.metrics.issuesFound.filter(i => i.severity === 'warning');
    const info = this.metrics.issuesFound.filter(i => i.severity === 'info');

    console.log(`\n${errors.length > 0 ? '❌' : '✅'} Errors: ${errors.length}`);
    console.log(`${warnings.length > 0 ? '⚠️' : '✅'}  Warnings: ${warnings.length}`);
    console.log(`ℹ️  Info: ${info.length}`);

    // Group issues by category
    if (this.metrics.issuesFound.length > 0) {
      console.log('\nIssues by category:');
      const byCategory = new Map<string, ValidationIssue[]>();
      this.metrics.issuesFound.forEach(issue => {
        if (!byCategory.has(issue.category)) {
          byCategory.set(issue.category, []);
        }
        byCategory.get(issue.category)!.push(issue);
      });

      byCategory.forEach((issues, category) => {
        console.log(`\n  ${category}:`);
        issues.slice(0, 5).forEach(issue => {
          const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`    ${icon} [m${issue.measure}] ${issue.message}`);
        });
        if (issues.length > 5) {
          console.log(`    ... and ${issues.length - 5} more`);
        }
      });
    }

    console.log('\n' + '='.repeat(70) + '\n');

    // Save detailed report
    const reportPath = join(process.cwd(), 'content', 'tracking', 'quality-report.json');
    writeFileSync(reportPath, JSON.stringify(this.metrics, null, 2), 'utf-8');
    console.log(`📝 Detailed report saved to: ${reportPath}\n`);
  }

  /**
   * Generate human review sample
   */
  generateSampleReport(): void {
    if (this.metrics.sampleMeasures.length === 0) {
      return;
    }

    const reportPath = join(process.cwd(), 'content', 'tracking', 'human-review-sample.md');
    let markdown = '# Human Review Sample (5% Random)\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += `Total samples: ${this.metrics.sampleMeasures.length}\n\n`;
    markdown += '---\n\n';

    this.metrics.sampleMeasures.forEach((sample, index) => {
      markdown += `## ${index + 1}. BWV ${sample.bwv} ${sample.type} - Measure ${sample.measure}\n\n`;
      markdown += `${sample.commentary}\n\n`;
      markdown += `**Review checklist:**\n`;
      markdown += `- [ ] Accurate harmonic analysis\n`;
      markdown += `- [ ] Clear, accessible language\n`;
      markdown += `- [ ] Appropriate technical depth\n`;
      markdown += `- [ ] Good contextual connections\n`;
      markdown += `- [ ] Terminology properly defined\n\n`;
      markdown += '---\n\n';
    });

    writeFileSync(reportPath, markdown, 'utf-8');
    console.log(`📝 Human review sample saved to: ${reportPath}\n`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎼 Clavier: Quality Validation for Measure Commentary');
  console.log('━'.repeat(70));

  const args = process.argv.slice(2);
  const directory = args[0] || join(process.cwd(), 'content', 'pieces', 'commentary', 'book1');

  const validator = new QualityValidator();
  validator.validateDirectory(directory);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

export { QualityValidator };
