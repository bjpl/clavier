#!/usr/bin/env tsx
/**
 * Download MusicXML files from Open Well-Tempered Clavier
 *
 * Downloads 48 WTC pieces from welltemperedclavier.org
 * Saves as BWV-{number}-{book}-{type}-{key}.musicxml
 * Includes progress tracking and resume capability
 */

import { promises as fs } from 'fs';
import path from 'path';
import { setTimeout } from 'timers/promises';
import {
  WTC_CATALOG,
  FILE_NAMING,
  DOWNLOAD_CONFIG,
  PROGRESS_FILE,
  type DownloadProgress,
  type WTCPiece,
} from './music-files-config';

class MusicXMLDownloader {
  private progress: DownloadProgress = {
    lastUpdated: new Date().toISOString(),
    completed: [],
    failed: [],
  };

  private async loadProgress(): Promise<void> {
    try {
      const data = await fs.readFile(PROGRESS_FILE, 'utf-8');
      this.progress = JSON.parse(data);
      console.log(`✓ Loaded progress: ${this.progress.completed.length} completed, ${this.progress.failed.length} failed`);
    } catch (error) {
      console.log('No existing progress file found, starting fresh');
    }
  }

  private async saveProgress(): Promise<void> {
    this.progress.lastUpdated = new Date().toISOString();
    await fs.mkdir(path.dirname(PROGRESS_FILE), { recursive: true });
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  private async downloadFile(url: string, destination: string, retries = DOWNLOAD_CONFIG.retryAttempts): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`  Downloading (attempt ${attempt}/${retries})...`);

        const controller = new AbortController();
        const timeout = setTimeout(DOWNLOAD_CONFIG.timeoutMs).then(() => controller.abort());

        const response = await fetch(url, {
          headers: {
            'User-Agent': DOWNLOAD_CONFIG.userAgent,
          },
          signal: controller.signal,
        });

        clearTimeout(timeout as any);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const content = await response.text();

        // Validate it's actual XML
        if (!content.includes('<?xml') || !content.includes('<score-partwise')) {
          throw new Error('Downloaded content is not valid MusicXML');
        }

        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.writeFile(destination, content, 'utf-8');

        console.log(`  ✓ Saved to ${destination}`);
        return;

      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`  ✗ Attempt ${attempt} failed: ${message}`);

        if (attempt < retries) {
          console.log(`  Retrying in ${DOWNLOAD_CONFIG.retryDelayMs / 1000}s...`);
          await setTimeout(DOWNLOAD_CONFIG.retryDelayMs);
        } else {
          throw new Error(`Failed after ${retries} attempts: ${message}`);
        }
      }
    }
  }

  private async downloadPiece(piece: WTCPiece, type: 'prelude' | 'fugue'): Promise<boolean> {
    const fileName = FILE_NAMING.getFileName(piece.bwv, piece.book, type, piece.key);
    const filePath = FILE_NAMING.getFilePath(piece.book, fileName);
    const absolutePath = path.join(process.cwd(), filePath);

    // Check if already completed
    const alreadyDownloaded = this.progress.completed.some(
      c => c.bwv === piece.bwv && c.type === type
    );

    if (alreadyDownloaded) {
      console.log(`⊘ BWV ${piece.bwv} ${type} already downloaded, skipping`);
      return true;
    }

    // Check if file already exists
    try {
      await fs.access(absolutePath);
      console.log(`⊘ BWV ${piece.bwv} ${type} file exists, marking as completed`);
      this.progress.completed.push({
        bwv: piece.bwv,
        type,
        fileName,
        downloadedAt: new Date().toISOString(),
      });
      await this.saveProgress();
      return true;
    } catch {
      // File doesn't exist, proceed with download
    }

    console.log(`\n→ BWV ${piece.bwv} ${type} (${piece.key})`);

    try {
      // Construct download URL
      // Note: This is a placeholder. Actual URLs need to be determined from MuseScore
      const url = this.constructDownloadUrl(piece, type);

      if (!url) {
        console.log(`  ⊘ No download URL configured for BWV ${piece.bwv} ${type}`);
        return false;
      }

      await this.downloadFile(url, absolutePath);

      this.progress.completed.push({
        bwv: piece.bwv,
        type,
        fileName,
        downloadedAt: new Date().toISOString(),
      });

      await this.saveProgress();
      return true;

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Failed: ${message}`);

      this.progress.failed.push({
        bwv: piece.bwv,
        type,
        error: message,
        attemptedAt: new Date().toISOString(),
      });

      await this.saveProgress();
      return false;
    }
  }

  private constructDownloadUrl(_piece: WTCPiece, _type: 'prelude' | 'fugue'): string | null {
    // This is a placeholder implementation
    // Actual implementation would use MUSESCORE_SCORE_IDS or direct download links
    // For now, return null to indicate manual download needed

    // Example format (would need actual score IDs):
    // return `https://musescore.com/download/score/${scoreId}.musicxml`;

    console.log(`  ℹ Manual download required from: https://welltemperedclavier.org/`);
    return null;
  }

  private async rateLimit(): Promise<void> {
    await setTimeout(DOWNLOAD_CONFIG.rateLimit.delayBetweenRequests);
  }

  async downloadAll(): Promise<void> {
    console.log('='.repeat(60));
    console.log('MusicXML Download for Well-Tempered Clavier');
    console.log('='.repeat(60));
    console.log(`Total pieces to download: ${WTC_CATALOG.length * 2} (48 preludes + 48 fugues)\n`);

    await this.loadProgress();

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (const piece of WTC_CATALOG) {
      // Download prelude
      if (piece.prelude) {
        const success = await this.downloadPiece(piece, 'prelude');
        if (success) successCount++;
        else failCount++;
        await this.rateLimit();
      }

      // Download fugue
      if (piece.fugue) {
        const success = await this.downloadPiece(piece, 'fugue');
        if (success) successCount++;
        else failCount++;
        await this.rateLimit();
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Download Summary');
    console.log('='.repeat(60));
    console.log(`✓ Successful: ${successCount}`);
    console.log(`✗ Failed: ${failCount}`);
    console.log(`⊘ Skipped (already downloaded): ${skipCount}`);
    console.log(`\nProgress saved to: ${PROGRESS_FILE}`);

    if (failCount > 0) {
      console.log('\nFailed downloads:');
      for (const failed of this.progress.failed) {
        console.log(`  - BWV ${failed.bwv} ${failed.type}: ${failed.error}`);
      }
    }
  }

  async downloadManual(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('MANUAL DOWNLOAD INSTRUCTIONS');
    console.log('='.repeat(60));
    console.log('\nSince automated download URLs are not available, please:');
    console.log('\n1. Visit: https://welltemperedclavier.org/');
    console.log('2. Download each piece as MusicXML from MuseScore');
    console.log('3. Save files to the following locations:\n');

    for (const piece of WTC_CATALOG) {
      if (piece.prelude) {
        const fileName = FILE_NAMING.getFileName(piece.bwv, piece.book, 'prelude', piece.key);
        const filePath = FILE_NAMING.getFilePath(piece.book, fileName);
        console.log(`   ${filePath}`);
      }
      if (piece.fugue) {
        const fileName = FILE_NAMING.getFileName(piece.bwv, piece.book, 'fugue', piece.key);
        const filePath = FILE_NAMING.getFilePath(piece.book, fileName);
        console.log(`   ${filePath}`);
      }
    }

    console.log('\n4. Run the validation script to check downloads:');
    console.log('   npm run music:validate\n');
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const downloader = new MusicXMLDownloader();

  const args = process.argv.slice(2);
  const mode = args[0];

  if (mode === '--manual') {
    downloader.downloadManual().catch(console.error);
  } else {
    downloader.downloadAll().catch(console.error);
  }
}

export { MusicXMLDownloader };
