#!/usr/bin/env node

/**
 * Export Commentary to Markdown for Human Review
 *
 * Exports generated measure commentary to readable markdown files
 * organized by piece for easy review and editing.
 */

import { PieceCommentary } from './generate-measure-commentary';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

class MarkdownExporter {
  /**
   * Export single piece to markdown
   */
  exportPiece(commentary: PieceCommentary, outputPath: string): void {
    let markdown = `# BWV ${commentary.bwv} ${commentary.type.charAt(0).toUpperCase() + commentary.type.slice(1)} in ${commentary.key}\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n`;
    markdown += `**Total Measures:** ${commentary.measures.length}\n\n`;
    markdown += '---\n\n';

    commentary.measures.forEach(measure => {
      markdown += `## Measure ${measure.measure_number}\n\n`;

      // Harmony
      markdown += `**Harmony:** ${measure.harmony.roman_numeral} (${measure.harmony.chord}) - ${measure.harmony.function}\n\n`;

      // Commentary
      markdown += `${measure.commentary}\n\n`;

      // Voice Activity (for fugues)
      if (measure.voice_activity && Object.keys(measure.voice_activity).length > 0) {
        markdown += `**Voice Activity:**\n`;
        Object.entries(measure.voice_activity).forEach(([voice, activity]) => {
          markdown += `- ${voice.charAt(0).toUpperCase() + voice.slice(1)}: ${activity}\n`;
        });
        markdown += '\n';
      }

      // Terminology
      if (measure.terminology_introduced.length > 0) {
        markdown += `**Terminology Introduced:**\n`;
        measure.terminology_introduced.forEach(term => {
          markdown += `- **${term.term}**: ${term.definition}\n`;
        });
        markdown += '\n';
      }

      // Notable Features
      if (measure.notable_features.length > 0) {
        markdown += `**Notable Features:** ${measure.notable_features.join(', ')}\n\n`;
      }

      // Connections
      markdown += `**Connections:**\n`;
      if (measure.connections.references_back) {
        markdown += `- *References:* ${measure.connections.references_back}\n`;
      }
      markdown += `- *Sets up:* ${measure.connections.sets_up}\n\n`;

      markdown += '---\n\n';
    });

    // Summary statistics
    markdown += '## Statistics\n\n';
    markdown += `- Total measures: ${commentary.measures.length}\n`;
    markdown += `- Total terminology introduced: ${commentary.measures.reduce((sum, m) => sum + m.terminology_introduced.length, 0)}\n`;
    markdown += `- Total notable features: ${commentary.measures.reduce((sum, m) => sum + m.notable_features.length, 0)}\n`;

    writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`   ✓ Exported to: ${outputPath}`);
  }

  /**
   * Export all commentary files to markdown
   */
  exportAll(inputDir: string, outputDir: string): void {
    console.log(`\n📝 Exporting commentary to markdown...\n`);

    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const files = readdirSync(inputDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} commentary files\n`);

    files.forEach(file => {
      const filePath = join(inputDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const commentary: PieceCommentary = JSON.parse(content);

      const mdFilename = file.replace('.json', '.md');
      const outputPath = join(outputDir, mdFilename);

      console.log(`📄 ${file}`);
      this.exportPiece(commentary, outputPath);
    });

    console.log(`\n✅ Exported ${files.length} files to markdown\n`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎼 Clavier: Export Commentary to Markdown');
  console.log('━'.repeat(60));

  const args = process.argv.slice(2);
  const inputDir = args[0] || join(process.cwd(), 'content', 'pieces', 'commentary', 'book1');
  const outputDir = args[1] || join(process.cwd(), 'docs', 'generation', 'review-markdown');

  const exporter = new MarkdownExporter();
  exporter.exportAll(inputDir, outputDir);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
}

export { MarkdownExporter };
