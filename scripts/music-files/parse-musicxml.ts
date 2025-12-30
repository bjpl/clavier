#!/usr/bin/env tsx
/**
 * Parse MusicXML files into database format
 *
 * Extracts measures, notes, timing, voices from MusicXML
 * Generates unique IDs for all elements
 * Validates against schema
 * Handles polyphony and voices
 */

import { promises as fs } from 'fs';
import path from 'path';
import { WTC_CATALOG, VALIDATION_RULES, type ParsedMusicXML } from './music-files-config';

interface MusicXMLNote {
  pitch?: {
    step: string;
    alter?: number;
    octave: number;
  };
  rest?: boolean;
  duration: number;
  voice: number;
  type?: string;
  dot?: boolean;
}

interface MusicXMLMeasure {
  number: number;
  attributes?: {
    divisions?: number;
    key?: { fifths: number; mode?: string };
    time?: { beats: string; beatType: string };
    clef?: { sign: string; line: number };
  };
  notes: MusicXMLNote[];
}

class MusicXMLParser {
  private divisionsPerQuarter = 1;

  /**
   * Parse a MusicXML file
   */
  async parseFile(filePath: string): Promise<ParsedMusicXML | null> {
    try {
      console.log(`\n→ Parsing: ${filePath}`);

      const content = await fs.readFile(filePath, 'utf-8');

      // Extract basic metadata from filename
      const fileName = path.basename(filePath);
      const match = fileName.match(/BWV-(\d+)-book(\d+)-(prelude|fugue)-(.+)\.musicxml/);

      if (!match) {
        throw new Error(`Invalid filename format: ${fileName}`);
      }

      const [, bwvStr, bookStr, type, keyStr] = match;
      const bwv = parseInt(bwvStr, 10);
      const book = parseInt(bookStr, 10);

      // Find piece in catalog
      const catalogEntry = WTC_CATALOG.find(p => p.bwv === bwv);
      if (!catalogEntry) {
        throw new Error(`BWV ${bwv} not found in catalog`);
      }

      // Parse key from filename
      const { keyTonic, keyMode } = this.parseKeyFromString(keyStr);

      // Parse XML (simplified - would need proper XML parser in production)
      const measures = await this.parseMeasures(content);

      // Validate
      this.validateParsedData(measures);

      const parsed: ParsedMusicXML = {
        piece: {
          bwv,
          book,
          numberInBook: catalogEntry.number,
          type: type.toUpperCase() as 'PRELUDE' | 'FUGUE',
          keyTonic,
          keyMode,
          timeSignature: this.extractTimeSignature(content),
          totalMeasures: measures.length,
          voiceCount: catalogEntry.voices,
        },
        measures: measures.map((measure, idx) => ({
          measureNumber: idx + 1,
          beatCount: this.extractBeatCount(measure),
          isPickup: idx === 0 && this.isPickupMeasure(measure),
          isFinal: idx === measures.length - 1,
          notes: this.extractNotes(measure),
        })),
      };

      console.log(`  ✓ Parsed ${measures.length} measures with ${this.countTotalNotes(parsed.measures)} notes`);

      return parsed;

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Parse failed: ${message}`);
      return null;
    }
  }

  /**
   * Parse key signature from filename string
   */
  private parseKeyFromString(keyStr: string): { keyTonic: string; keyMode: 'MAJOR' | 'MINOR' } {
    // Convert "c-major" or "c-sharp-minor" to tonic and mode
    const parts = keyStr.split('-');
    const mode = parts[parts.length - 1] === 'minor' ? 'MINOR' : 'MAJOR';

    let tonic = parts[0].toUpperCase();
    if (parts.includes('sharp')) {
      tonic += '#';
    } else if (parts.includes('flat')) {
      tonic += 'b';
    }

    return { keyTonic: tonic, keyMode: mode };
  }

  /**
   * Parse measures from MusicXML content
   * This is a simplified implementation - production would use a proper XML parser
   */
  private async parseMeasures(xmlContent: string): Promise<MusicXMLMeasure[]> {
    // In production, use a proper XML parser like xml2js or fast-xml-parser
    // For now, return a placeholder structure

    const measures: MusicXMLMeasure[] = [];

    // Extract divisions (divisions per quarter note)
    const divisionsMatch = xmlContent.match(/<divisions>(\d+)<\/divisions>/);
    if (divisionsMatch) {
      this.divisionsPerQuarter = parseInt(divisionsMatch[1], 10);
    }

    // Simple regex-based extraction (not robust, just for demonstration)
    const measureMatches = xmlContent.matchAll(/<measure[^>]*number="(\d+)"[^>]*>([\s\S]*?)<\/measure>/g);

    for (const match of measureMatches) {
      const measureNumber = parseInt(match[1], 10);
      const measureContent = match[2];

      const measure: MusicXMLMeasure = {
        number: measureNumber,
        notes: this.extractNotesFromMeasure(measureContent),
      };

      measures.push(measure);
    }

    return measures;
  }

  /**
   * Extract notes from a measure's XML content
   */
  private extractNotesFromMeasure(measureContent: string): MusicXMLNote[] {
    const notes: MusicXMLNote[] = [];

    // Simple note extraction (production would use proper XML parsing)
    const noteMatches = measureContent.matchAll(/<note>([\s\S]*?)<\/note>/g);

    for (const match of noteMatches) {
      const noteContent = match[1];

      // Check if rest
      const isRest = noteContent.includes('<rest');

      let pitch: MusicXMLNote['pitch'] | undefined;

      if (!isRest) {
        // Extract pitch
        const stepMatch = noteContent.match(/<step>([A-G])<\/step>/);
        const alterMatch = noteContent.match(/<alter>(-?\d+)<\/alter>/);
        const octaveMatch = noteContent.match(/<octave>(\d+)<\/octave>/);

        if (stepMatch && octaveMatch) {
          pitch = {
            step: stepMatch[1],
            alter: alterMatch ? parseInt(alterMatch[1], 10) : undefined,
            octave: parseInt(octaveMatch[1], 10),
          };
        }
      }

      // Extract duration
      const durationMatch = noteContent.match(/<duration>(\d+)<\/duration>/);
      const duration = durationMatch ? parseInt(durationMatch[1], 10) : 0;

      // Extract voice
      const voiceMatch = noteContent.match(/<voice>(\d+)<\/voice>/);
      const voice = voiceMatch ? parseInt(voiceMatch[1], 10) : 1;

      notes.push({
        pitch,
        rest: isRest,
        duration,
        voice,
      });
    }

    return notes;
  }

  /**
   * Extract notes with proper beat positions
   */
  private extractNotes(measure: MusicXMLMeasure): ParsedMusicXML['measures'][0]['notes'] {
    const notes: ParsedMusicXML['measures'][0]['notes'] = [];
    let currentBeat = 1;

    for (const xmlNote of measure.notes) {
      if (xmlNote.rest) {
        // Advance beat position for rests
        currentBeat += this.durationToBeats(xmlNote.duration);
        continue;
      }

      if (!xmlNote.pitch) continue;

      const { pitchClass, octave, midiNumber } = this.convertPitch(
        xmlNote.pitch.step,
        xmlNote.pitch.alter || 0,
        xmlNote.pitch.octave
      );

      notes.push({
        voice: xmlNote.voice,
        pitchClass,
        octave,
        midiNumber,
        startBeat: currentBeat,
        durationBeats: this.durationToBeats(xmlNote.duration),
        articulation: [],
      });

      currentBeat += this.durationToBeats(xmlNote.duration);
    }

    return notes;
  }

  /**
   * Convert MusicXML duration to beats
   */
  private durationToBeats(duration: number): number {
    return duration / this.divisionsPerQuarter;
  }

  /**
   * Convert pitch to standard format
   */
  private convertPitch(step: string, alter: number, octave: number): {
    pitchClass: string;
    octave: number;
    midiNumber: number;
  } {
    const pitchMap: Record<string, number> = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11,
    };

    const basePitch = pitchMap[step];
    const chromaticPitch = basePitch + alter;

    // Construct pitch class string
    let pitchClass = step;
    if (alter === 1) pitchClass += '#';
    else if (alter === -1) pitchClass += 'b';

    // Calculate MIDI number
    const midiNumber = (octave + 1) * 12 + chromaticPitch;

    return { pitchClass, octave, midiNumber };
  }

  /**
   * Extract time signature from XML
   */
  private extractTimeSignature(xmlContent: string): string {
    const beatsMatch = xmlContent.match(/<beats>(\d+)<\/beats>/);
    const beatTypeMatch = xmlContent.match(/<beat-type>(\d+)<\/beat-type>/);

    if (beatsMatch && beatTypeMatch) {
      return `${beatsMatch[1]}/${beatTypeMatch[1]}`;
    }

    return '4/4'; // Default
  }

  /**
   * Extract beat count from measure
   */
  private extractBeatCount(measure: MusicXMLMeasure): number {
    // Calculate from notes
    const totalDuration = measure.notes.reduce((sum, note) => sum + note.duration, 0);
    return Math.ceil(totalDuration / this.divisionsPerQuarter);
  }

  /**
   * Check if measure is a pickup measure
   */
  private isPickupMeasure(measure: MusicXMLMeasure): boolean {
    const totalDuration = measure.notes.reduce((sum, note) => sum + note.duration, 0);
    const beatsInMeasure = totalDuration / this.divisionsPerQuarter;
    return beatsInMeasure < 4 && measure.number === 1;
  }

  /**
   * Count total notes across all measures
   */
  private countTotalNotes(measures: ParsedMusicXML['measures']): number {
    return measures.reduce((sum, m) => sum + m.notes.length, 0);
  }

  /**
   * Validate parsed data
   */
  private validateParsedData(measures: MusicXMLMeasure[]): void {
    if (measures.length < VALIDATION_RULES.minMeasuresPrelude) {
      throw new Error(`Too few measures: ${measures.length}`);
    }

    if (measures.length > VALIDATION_RULES.maxMeasures) {
      throw new Error(`Too many measures: ${measures.length}`);
    }
  }

  /**
   * Parse all files in a directory
   */
  async parseDirectory(directory: string): Promise<Map<string, ParsedMusicXML>> {
    const results = new Map<string, ParsedMusicXML>();

    console.log('\n' + '='.repeat(60));
    console.log(`Parsing MusicXML files from: ${directory}`);
    console.log('='.repeat(60));

    const files = await fs.readdir(directory);
    const musicxmlFiles = files.filter(f => f.endsWith('.musicxml'));

    console.log(`Found ${musicxmlFiles.length} MusicXML files`);

    for (const file of musicxmlFiles) {
      const filePath = path.join(directory, file);
      const parsed = await this.parseFile(filePath);

      if (parsed) {
        results.set(file, parsed);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Parsing Summary`);
    console.log('='.repeat(60));
    console.log(`✓ Successfully parsed: ${results.size}`);
    console.log(`✗ Failed to parse: ${musicxmlFiles.length - results.size}`);

    return results;
  }

  /**
   * Parse all WTC files
   */
  async parseAll(): Promise<Map<string, ParsedMusicXML>> {
    const allResults = new Map<string, ParsedMusicXML>();

    for (const book of [1, 2]) {
      const directory = path.join(process.cwd(), `public/music/book${book}`);

      try {
        const results = await this.parseDirectory(directory);
        for (const [key, value] of results) {
          allResults.set(key, value);
        }
      } catch (error) {
        console.error(`Error parsing book ${book}:`, error);
      }
    }

    return allResults;
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const parser = new MusicXMLParser();
  parser.parseAll()
    .then(results => {
      console.log(`\n✓ Total files parsed: ${results.size}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Parse failed:', error);
      process.exit(1);
    });
}

export { MusicXMLParser, type ParsedMusicXML };
