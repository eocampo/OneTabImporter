/**
 * Import Command - Import OneTab data from JSON or LevelDB
 */

import chalk from 'chalk';
import { resolve } from 'path';
import type { ImportOptions, MasterData } from '../models/types.js';
import { DEFAULT_EXTENSION_IDS, DEFAULT_PATHS } from '../models/types.js';
import { parseOneTabJson, mergeMasterData } from '../parsers/json.js';
import { parseLevelDb } from '../parsers/leveldb.js';
import { readJson, writeJson, exists, getDefaultLevelDbPath } from '../utils/files.js';

/**
 * Execute the import command
 */
export async function importCommand(options: ImportOptions): Promise<void> {
  console.log(chalk.blue('🔄 OneTab Import'));
  console.log('');

  const browser = options.browser ?? 'edge';
  const extensionId = options.extensionId ?? DEFAULT_EXTENSION_IDS[browser];
  const outputPath = resolve(options.output ?? DEFAULT_PATHS.masterJson);

  let masterData: MasterData;

  // Determine input source
  if (options.input) {
    // Import from JSON file (DevTools export)
    const inputPath = resolve(options.input);

    if (!(await exists(inputPath))) {
      console.error(chalk.red(`❌ Input file not found: ${inputPath}`));
      process.exit(1);
    }

    console.log(chalk.gray(`📂 Reading JSON from: ${inputPath}`));
    const rawData = await readJson<unknown>(inputPath);

    masterData = parseOneTabJson(rawData, {
      browser,
      extensionId,
      extractionMethod: 'devtools',
    });

    console.log(chalk.green(`✅ Parsed ${masterData.stats.totalGroups} groups with ${masterData.stats.totalTabs} tabs`));

  } else if (options.leveldb) {
    // Import from LevelDB copy
    const leveldbPath = resolve(options.leveldb);

    if (!(await exists(leveldbPath))) {
      console.error(chalk.red(`❌ LevelDB directory not found: ${leveldbPath}`));
      console.log(chalk.yellow('\n💡 Tip: Run the copy-leveldb script first:'));
      console.log(chalk.gray('   npm run copy-db'));
      process.exit(1);
    }

    console.log(chalk.gray(`📂 Reading LevelDB from: ${leveldbPath}`));

    masterData = await parseLevelDb(leveldbPath, {
      browser,
      extensionId,
      extractionMethod: 'leveldb',
    });

    console.log(chalk.green(`✅ Parsed ${masterData.stats.totalGroups} groups with ${masterData.stats.totalTabs} tabs`));

  } else {
    // Try default LevelDB copy location
    const defaultCopyPath = resolve(DEFAULT_PATHS.leveldbCopy);

    if (await exists(defaultCopyPath)) {
      console.log(chalk.gray(`📂 Using default LevelDB copy: ${defaultCopyPath}`));

      masterData = await parseLevelDb(defaultCopyPath, {
        browser,
        extensionId,
        extractionMethod: 'leveldb',
      });

      console.log(chalk.green(`✅ Parsed ${masterData.stats.totalGroups} groups with ${masterData.stats.totalTabs} tabs`));

    } else {
      // Show help
      console.error(chalk.red('❌ No input source specified'));
      console.log('');
      console.log(chalk.yellow('Please provide one of the following:'));
      console.log('');
      console.log(chalk.gray('  1. JSON export from DevTools:'));
      console.log(chalk.white('     onetab import --input onetab-export.json'));
      console.log('');
      console.log(chalk.gray('  2. LevelDB copy:'));
      console.log(chalk.white('     npm run copy-db'));
      console.log(chalk.white('     onetab import --leveldb ./leveldb-copy'));
      console.log('');
      console.log(chalk.gray('  3. Or place LevelDB copy at default location:'));
      console.log(chalk.white(`     ${defaultCopyPath}`));
      console.log('');

      // Show browser LevelDB paths for reference
      console.log(chalk.yellow('Browser LevelDB locations:'));
      console.log(chalk.gray('  Edge:   ' + getDefaultLevelDbPath('edge', DEFAULT_EXTENSION_IDS.edge)));
      console.log(chalk.gray('  Chrome: ' + getDefaultLevelDbPath('chrome', DEFAULT_EXTENSION_IDS.chrome)));

      process.exit(1);
    }
  }

  // Check for existing master data to merge
  if (await exists(outputPath)) {
    console.log(chalk.gray(`📂 Found existing master data, merging...`));
    const existingData = await readJson<MasterData>(outputPath);
    const previousCount = existingData.stats.totalGroups;

    masterData = mergeMasterData(existingData, masterData);

    const newGroups = masterData.stats.totalGroups - previousCount;
    if (newGroups > 0) {
      console.log(chalk.green(`✅ Added ${newGroups} new groups`));
    } else {
      console.log(chalk.gray('ℹ️  No new groups to add'));
    }
  }

  // Save master data
  await writeJson(outputPath, masterData);
  console.log(chalk.green(`💾 Saved to: ${outputPath}`));

  // Print summary
  console.log('');
  console.log(chalk.blue('📊 Summary:'));
  console.log(chalk.gray(`   Total groups: ${masterData.stats.totalGroups}`));
  console.log(chalk.gray(`   Total tabs:   ${masterData.stats.totalTabs}`));
  console.log(chalk.gray(`   Date range:   ${masterData.stats.dateRange.earliest.substring(0, 10)} to ${masterData.stats.dateRange.latest.substring(0, 10)}`));
}

/**
 * Print DevTools extraction script for the user
 */
export function printExtractionScript(): void {
  console.log(chalk.blue('📋 DevTools Extraction Script'));
  console.log('');
  console.log(chalk.yellow('Run this in your browser DevTools console on the OneTab page:'));
  console.log('');
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.white(`
(async function() {
  console.log('🔍 Extracting OneTab data from Extension storage...');
  
  // OneTab 1.86+ stores data in chrome.storage.local (Extension storage)
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    console.error('❌ chrome.storage.local not available');
    console.log('Make sure you are running this on the OneTab extension page');
    return;
  }
  
  // Get all data from extension storage
  const data = await chrome.storage.local.get(null);
  console.log('📋 Extension storage keys:', Object.keys(data));
  
  if (!data.state) {
    console.error('❌ No state found in extension storage');
    console.log('Available keys:', Object.keys(data));
    return;
  }
  
  console.log('✅ Found state in extension storage');
  
  // Parse the state - it might be a string or object
  let state = data.state;
  if (typeof state === 'string') {
    try {
      state = JSON.parse(state);
    } catch (e) {
      console.error('❌ Could not parse state string:', e);
      return;
    }
  }
  
  console.log('📋 State keys:', Object.keys(state));
  
  // Get tabGroups - might be double-encoded as string
  let tabGroups = state.tabGroups;
  if (typeof tabGroups === 'string') {
    console.log('📦 tabGroups is a string, parsing...');
    try {
      tabGroups = JSON.parse(tabGroups);
    } catch (e) {
      console.error('❌ Could not parse tabGroups:', e);
      console.log('Raw tabGroups (first 500 chars):', tabGroups.substring(0, 500));
      return;
    }
  }
  
  if (!Array.isArray(tabGroups)) {
    console.error('❌ tabGroups is not an array:', typeof tabGroups);
    return;
  }
  
  // Build export object
  const exportData = {
    state: {
      tabGroups: tabGroups
    },
    _meta: {
      exportedAt: new Date().toISOString(),
      version: data.lastSeenVersion || 'unknown',
      source: 'extension-storage-export'
    }
  };
  
  console.log('📊 Found', tabGroups.length, 'tab groups');
  
  // Count total tabs
  let totalTabs = 0;
  for (const group of tabGroups) {
    totalTabs += group.tabsMeta?.length || 0;
  }
  console.log('📊 Total tabs:', totalTabs);
  
  // Show first group preview
  if (tabGroups.length > 0) {
    const first = tabGroups[0];
    console.log('📋 First group:', {
      id: first.id?.substring(0, 20) + '...',
      createDate: new Date(first.createDate).toISOString(),
      tabCount: first.tabsMeta?.length || 0
    });
  }
  
  // Download
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'onetab-export-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  
  console.log('✅ Download started! Check your Downloads folder.');
})();
`));
  console.log(chalk.gray('─'.repeat(60)));
  console.log('');
  console.log(chalk.green('Then import the downloaded file:'));
  console.log(chalk.white('  node dist/cli.js import --input onetab-export-YYYY-MM-DD.json'));
}
