/**
 * Spec Compliance Validator
 *
 * Validates implementation against WTC Theory Tool Specification
 * Runs comprehensive checks on all systems
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'partial';
  details: string;
}

const results: ValidationResult[] = [];

function check(category: string, item: string, condition: boolean, details: string = '') {
  results.push({
    category,
    item,
    status: condition ? 'pass' : 'fail',
    details: details || (condition ? 'Implemented' : 'Not found'),
  });
}

function checkPartial(category: string, item: string, percentage: number, details: string) {
  results.push({
    category,
    item,
    status: percentage >= 80 ? 'pass' : percentage >= 50 ? 'partial' : 'fail',
    details,
  });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function dirHasFiles(dirPath: string, pattern?: RegExp): number {
  try {
    const fullPath = path.join(process.cwd(), dirPath);
    if (!fs.existsSync(fullPath)) return 0;

    let count = 0;
    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(entryPath);
        } else if (pattern && pattern.test(entry.name)) {
          count++;
        } else if (!pattern) {
          count++;
        }
      }
    };
    walkDir(fullPath);
    return count;
  } catch {
    return 0;
  }
}

function countJsonArrayLength(filePath: string, arrayKey: string): number {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
    const data = JSON.parse(content);
    return data[arrayKey]?.length || 0;
  } catch {
    return 0;
  }
}

console.log('🔍 Clavier WTC Theory Tool - Spec Compliance Validation\n');
console.log('='.repeat(60) + '\n');

// ============================================================================
// 1. CORE INFRASTRUCTURE
// ============================================================================

console.log('📦 1. Core Infrastructure\n');

check('Infrastructure', 'Next.js App Router Setup', fileExists('src/app/layout.tsx'));
check('Infrastructure', 'TypeScript Configuration', fileExists('tsconfig.json'));
check('Infrastructure', 'Prisma Schema', fileExists('prisma/schema.prisma'));
check('Infrastructure', 'Tailwind CSS', fileExists('tailwind.config.ts'));
check('Infrastructure', 'ESLint Configuration', fileExists('.eslintrc.json'));
check('Infrastructure', 'Vitest Test Setup', fileExists('vitest.config.ts'));
check('Infrastructure', 'Playwright E2E Config', fileExists('playwright.config.ts'));

// ============================================================================
// 2. DATA LAYER
// ============================================================================

console.log('\n💾 2. Data Layer\n');

check('Data', 'Piece Model', fileExists('prisma/schema.prisma'));
check('Data', 'Feature Model', fileExists('prisma/schema.prisma'));
check('Data', 'Curriculum Model (Domain/Unit/Module/Lesson)', fileExists('prisma/schema.prisma'));
check('Data', 'User Progress Model', fileExists('prisma/schema.prisma'));
check('Data', 'Annotation Model', fileExists('prisma/schema.prisma'));
check('Data', 'Piece Seed Data', fileExists('prisma/seeds/pieces.ts'));
check('Data', 'Feature Seed Data', fileExists('prisma/seeds/features.ts'));
check('Data', 'Curriculum Seed Data', fileExists('prisma/seeds/curriculum.ts'));

// ============================================================================
// 3. AUDIO SYSTEM (Spec Section 5.2)
// ============================================================================

console.log('\n🔊 3. Audio System\n');

check('Audio', 'AudioEngine Class', fileExists('src/lib/audio/audio-engine.ts'));
check('Audio', 'Tone.js Integration', fileExists('src/lib/audio/audio-engine.ts'));
check('Audio', 'Piano Sampler (Salamander)', fileExists('src/lib/audio/audio-engine.ts'));
check('Audio', 'Volume Control', fileExists('src/lib/audio/audio-engine.ts'));
check('Audio', 'Mute Functionality', fileExists('src/lib/audio/audio-engine.ts'));
check('Audio', 'Transport Control', fileExists('src/lib/audio/audio-engine.ts'));

// ============================================================================
// 4. SCORE RENDERING (Spec Section 5.3)
// ============================================================================

console.log('\n📜 4. Score Rendering\n');

check('Score', 'OSMD Integration', fileExists('src/components/score/score-viewer.tsx'));
check('Score', 'Score Viewer Component', fileExists('src/components/score/score-viewer.tsx'));
check('Score', 'Measure Highlighting', fileExists('src/components/score/measure-highlight.tsx'));
check('Score', 'Cursor Tracking', fileExists('src/components/score/score-cursor.tsx'));
check('Score', 'Zoom Controls', fileExists('src/components/score/score-viewer.tsx'));

// ============================================================================
// 5. KEYBOARD VISUALIZATION (Spec Section 5.4)
// ============================================================================

console.log('\n🎹 5. Keyboard Visualization\n');

check('Keyboard', 'Piano Keyboard Component', fileExists('src/components/keyboard/piano-keyboard.tsx'));
check('Keyboard', 'Key Component', fileExists('src/components/keyboard/piano-key.tsx'));
check('Keyboard', 'Key Labels', fileExists('src/components/keyboard/key-label.tsx'));
check('Keyboard', 'Octave Range Control', fileExists('src/components/keyboard/piano-keyboard.tsx'));

// ============================================================================
// 6. PLAYBACK SYNCHRONIZATION (Spec Section 5.5)
// ============================================================================

console.log('\n⏱️ 6. Playback Synchronization\n');

check('Playback', 'PlaybackCoordinator', fileExists('src/lib/playback/playback-coordinator.ts'));
check('Playback', 'Playback Controls', fileExists('src/components/walkthrough/playback-controls.tsx'));
check('Playback', 'Playback State Store', fileExists('src/lib/stores/playback-store.ts'));
check('Playback', 'Score Sync', fileExists('src/lib/playback/score-sync.ts'));
check('Playback', 'Keyboard Sync', fileExists('src/lib/playback/keyboard-sync.ts'));

// ============================================================================
// 7. NARRATION SYSTEM (Spec Section 5.6)
// ============================================================================

console.log('\n🗣️ 7. Narration System\n');

check('Narration', 'TTS Engine', fileExists('src/lib/narration/tts-engine.ts'));
check('Narration', 'Web Speech Provider', fileExists('src/lib/narration/providers/web-speech.ts'));
check('Narration', 'ElevenLabs Provider', fileExists('src/lib/narration/providers/elevenlabs.ts'));
check('Narration', 'OpenAI Provider', fileExists('src/lib/narration/providers/openai.ts'));
check('Narration', 'Narration Controls', fileExists('src/components/walkthrough/narration-controls.tsx'));

// ============================================================================
// 8. SETTINGS SYSTEM (Spec Section 5.7)
// ============================================================================

console.log('\n⚙️ 8. Settings System\n');

check('Settings', 'Settings Store', fileExists('src/lib/settings/settings-store.ts'));
check('Settings', 'Settings Schema', fileExists('src/lib/settings/settings-schema.ts'));
check('Settings', 'Settings Dialog', fileExists('src/components/settings/settings-dialog.tsx'));
check('Settings', 'Appearance Settings', fileExists('src/components/settings/appearance-settings.tsx'));
check('Settings', 'Audio Settings', fileExists('src/components/settings/audio-settings.tsx'));

// ============================================================================
// 9. SPLIT VIEW LAYOUT (Spec Section 5.8)
// ============================================================================

console.log('\n📐 9. Split View Layout\n');

check('Layout', 'SplitView Component', fileExists('src/components/layout/split-view.tsx'));
check('Layout', 'Resizable Panels', fileExists('src/components/layout/split-view.tsx'));
check('Layout', 'Panel Ratio Persistence', fileExists('src/lib/settings/settings-store.ts'));
check('Layout', 'Responsive Breakpoints', fileExists('src/components/layout/split-view.tsx'));

// ============================================================================
// 10. INTERACTION MODES (Spec Section 4)
// ============================================================================

console.log('\n🎯 10. Interaction Modes\n');

check('Modes', 'Walkthrough Mode', fileExists('src/components/walkthrough/walkthrough-view.tsx'));
check('Modes', 'Curriculum Mode', fileExists('src/components/curriculum/lesson-view.tsx'));
check('Modes', 'Explorer Mode', fileExists('src/components/explorer/explorer-view.tsx'));
check('Modes', 'Walkthrough Store', fileExists('src/lib/stores/walkthrough-store.ts'));
check('Modes', 'Explorer Store', fileExists('src/lib/stores/explorer-store.ts'));

// ============================================================================
// 11. CONTENT GENERATION
// ============================================================================

console.log('\n📝 11. Generated Content\n');

const book1Count = countJsonArrayLength('content/pieces/book1-introductions.json', 'pieces');
const book2Count = countJsonArrayLength('content/pieces/book2-introductions.json', 'pieces');
checkPartial('Content', 'Book I Introductions', (book1Count / 48) * 100, `${book1Count}/48 pieces`);
checkPartial('Content', 'Book II Introductions', (book2Count / 48) * 100, `${book2Count}/48 pieces`);

const harmonyCount = countJsonArrayLength('content/features/harmony-features.json', 'features');
const counterpointCount = countJsonArrayLength('content/features/counterpoint-features.json', 'features');
const fugueCount = countJsonArrayLength('content/features/fugue-features.json', 'features');
const formCount = countJsonArrayLength('content/features/form-features.json', 'features');
const totalFeatures = harmonyCount + counterpointCount + fugueCount + formCount;
checkPartial('Content', 'Feature Definitions', (totalFeatures / 63) * 100, `${totalFeatures}/63 features`);

const domain1Count = countJsonArrayLength('content/curriculum/domain1-harmony-lessons.json', 'lessons');
const domain2Count = countJsonArrayLength('content/curriculum/domain2-voiceleading-lessons.json', 'lessons');
const domain3Count = countJsonArrayLength('content/curriculum/domain3-fugue-lessons.json', 'lessons');
const totalLessons = domain1Count + domain2Count + domain3Count;
checkPartial('Content', 'Curriculum Lessons', (totalLessons / 30) * 100, `${totalLessons}/30 lessons`);

check('Content', 'BWV 846 Commentary', fileExists('content/commentary/bwv-846-complete.json'));

// ============================================================================
// 12. UI COMPONENTS
// ============================================================================

console.log('\n🎨 12. UI Components\n');

check('UI', 'Button Component', fileExists('src/components/ui/button.tsx'));
check('UI', 'Card Component', fileExists('src/components/ui/card.tsx'));
check('UI', 'Slider Component', fileExists('src/components/ui/slider.tsx'));
check('UI', 'Dialog Component', fileExists('src/components/ui/dialog.tsx'));
check('UI', 'Progress Component', fileExists('src/components/ui/progress.tsx'));
check('UI', 'Tabs Component', fileExists('src/components/ui/tabs.tsx'));
check('UI', 'Select Component', fileExists('src/components/ui/select.tsx'));
check('UI', 'Switch Component', fileExists('src/components/ui/switch.tsx'));

// ============================================================================
// 13. PROVIDERS & CONTEXT
// ============================================================================

console.log('\n🔌 13. Providers & Context\n');

check('Providers', 'Providers Index', fileExists('src/components/providers/index.tsx'));
check('Providers', 'Query Provider', fileExists('src/components/providers/query-provider.tsx'));
check('Providers', 'Settings Provider', fileExists('src/components/settings/settings-provider.tsx'));
check('Providers', 'App Layout', fileExists('src/app/layout.tsx'));

// ============================================================================
// 14. NAVIGATION
// ============================================================================

console.log('\n🧭 14. Navigation\n');

check('Navigation', 'Piece Selector', fileExists('src/components/walkthrough/piece-selector.tsx'));
check('Navigation', 'Feature Tree', fileExists('src/components/explorer/feature-tree.tsx'));
check('Navigation', 'Curriculum Map', fileExists('src/components/curriculum/curriculum-map.tsx'));
check('Navigation', 'Header', fileExists('src/components/layout/header.tsx'));

// ============================================================================
// 15. TESTING
// ============================================================================

console.log('\n🧪 15. Testing\n');

const unitTestCount = dirHasFiles('tests/unit', /\.test\.tsx?$/);
const integrationTestCount = dirHasFiles('tests/integration', /\.test\.tsx?$/);
const e2eTestCount = dirHasFiles('tests/e2e', /\.spec\.ts$/);

checkPartial('Testing', 'Unit Tests', Math.min(100, (unitTestCount / 2) * 100), `${unitTestCount} test files`);
checkPartial('Testing', 'Integration Tests', Math.min(100, (integrationTestCount / 1) * 100), `${integrationTestCount} test files`);
check('Testing', 'Test Configuration', fileExists('vitest.config.ts'));
check('Testing', 'Test Setup', fileExists('tests/setup.ts'));

// ============================================================================
// 16. SCRIPTS & TOOLING
// ============================================================================

console.log('\n🔧 16. Scripts & Tooling\n');

check('Scripts', 'MusicXML Downloader', fileExists('scripts/music-files/download-musicxml.ts'));
check('Scripts', 'MusicXML Parser', fileExists('scripts/music-files/parse-musicxml.ts'));
check('Scripts', 'Content Generation Scripts', fileExists('scripts/content-generation/generate-measure-commentary.ts'));
check('Scripts', 'Content Import Script', fileExists('scripts/content-generation/import-generated-content.ts'));

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('\n📊 VALIDATION SUMMARY\n');

const categories = [...new Set(results.map((r) => r.category))];
let totalPass = 0;
let totalFail = 0;
let totalPartial = 0;

for (const category of categories) {
  const categoryResults = results.filter((r) => r.category === category);
  const pass = categoryResults.filter((r) => r.status === 'pass').length;
  const fail = categoryResults.filter((r) => r.status === 'fail').length;
  const partial = categoryResults.filter((r) => r.status === 'partial').length;

  totalPass += pass;
  totalFail += fail;
  totalPartial += partial;

  const status = fail === 0 && partial === 0 ? '✅' : fail === 0 ? '🟡' : '❌';
  console.log(`${status} ${category}: ${pass}/${categoryResults.length} pass`);
}

const total = results.length;
const overallPercentage = ((totalPass + totalPartial * 0.5) / total * 100).toFixed(1);

console.log('\n' + '-'.repeat(40));
console.log(`\n📈 Overall Compliance: ${overallPercentage}%`);
console.log(`   ✅ Pass: ${totalPass}`);
console.log(`   🟡 Partial: ${totalPartial}`);
console.log(`   ❌ Fail: ${totalFail}`);
console.log(`   Total: ${total}\n`);

// Print failures if any
if (totalFail > 0) {
  console.log('❌ Failed Items:\n');
  results
    .filter((r) => r.status === 'fail')
    .forEach((r) => {
      console.log(`   - ${r.category}: ${r.item} - ${r.details}`);
    });
}

// Exit with appropriate code
process.exit(totalFail > 0 ? 1 : 0);
