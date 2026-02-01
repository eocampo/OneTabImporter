#!/usr/bin/env node

/**
 * OneTab Importer CLI
 * 
 * Import OneTab links with timestamps, export to JSON and Markdown,
 * and search through your saved tabs.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { importCommand, printExtractionScript } from './commands/import.js';
import { exportCommand, exportSingleFile } from './commands/export.js';
import { searchCommand, listDomainsCommand } from './commands/search.js';
import { listLevelDbKeys, dumpLevelDb } from './parsers/leveldb.js';
import { DEFAULT_EXTENSION_IDS, DEFAULT_PATHS } from './models/types.js';
import { writeJson } from './utils/files.js';

const program = new Command();

program
  .name('onetab')
  .description('Import and manage OneTab links with timestamps')
  .version('1.0.0');

// ============================================================================
// Import Command
// ============================================================================

program
  .command('import')
  .description('Import OneTab data from JSON export or LevelDB')
  .option('-i, --input <path>', 'JSON file from DevTools export')
  .option('-l, --leveldb <path>', 'LevelDB directory path')
  .option('-b, --browser <browser>', 'Browser type: edge | chrome', 'edge')
  .option('-e, --extension-id <id>', 'Custom extension ID')
  .option('-o, --output <path>', 'Output master JSON path', DEFAULT_PATHS.masterJson)
  .action(async (options) => {
    try {
      await importCommand(options);
    } catch (error) {
      console.error(chalk.red('❌ Import failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Export Command
// ============================================================================

program
  .command('export')
  .description('Export master data to Markdown files')
  .option('-i, --input <path>', 'Master JSON input path', DEFAULT_PATHS.masterJson)
  .option('-o, --output <path>', 'Output directory', DEFAULT_PATHS.outputDir)
  .option('-g, --group-by <period>', 'Group by: month | week | day', 'month')
  .option('--from <date>', 'Filter from date (YYYY-MM-DD or YYYY-MM)')
  .option('--to <date>', 'Filter to date (YYYY-MM-DD or YYYY-MM)')
  .option('--single', 'Export as single consolidated file')
  .action(async (options) => {
    try {
      if (options.single) {
        await exportSingleFile(options);
      } else {
        await exportCommand(options);
      }
    } catch (error) {
      console.error(chalk.red('❌ Export failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Search Command
// ============================================================================

program
  .command('search')
  .description('Search through OneTab data')
  .option('-q, --query <text>', 'Search query (matches title and URL)')
  .option('-u, --url-pattern <regex>', 'URL pattern (regex)')
  .option('-t, --title-pattern <regex>', 'Title pattern (regex)')
  .option('-d, --domain <domain>', 'Domain filter')
  .option('--from <date>', 'Filter from date')
  .option('--to <date>', 'Filter to date')
  .option('-f, --format <format>', 'Output format: console | json | markdown', 'console')
  .option('-i, --input <path>', 'Master JSON input path', DEFAULT_PATHS.masterJson)
  .action(async (options) => {
    try {
      await searchCommand(options);
    } catch (error) {
      console.error(chalk.red('❌ Search failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Utility Commands
// ============================================================================

program
  .command('domains')
  .description('List all unique domains with counts')
  .option('-i, --input <path>', 'Master JSON input path', DEFAULT_PATHS.masterJson)
  .action(async (options) => {
    try {
      await listDomainsCommand(options.input);
    } catch (error) {
      console.error(chalk.red('❌ Failed:'), error);
      process.exit(1);
    }
  });

program
  .command('script')
  .description('Print the DevTools extraction script')
  .action(() => {
    printExtractionScript();
  });

// ============================================================================
// Debug Commands
// ============================================================================

const debug = program.command('debug').description('Debug utilities');

debug
  .command('list-keys')
  .description('List all keys in a LevelDB database')
  .argument('<path>', 'LevelDB directory path')
  .action(async (path) => {
    try {
      const keys = await listLevelDbKeys(path);
      console.log(chalk.blue('Keys in LevelDB:'));
      for (const key of keys) {
        console.log(chalk.gray(`  ${key}`));
      }
      console.log(chalk.gray(`\nTotal: ${keys.length} keys`));
    } catch (error) {
      console.error(chalk.red('❌ Failed:'), error);
      process.exit(1);
    }
  });

debug
  .command('dump')
  .description('Dump all data from a LevelDB database')
  .argument('<path>', 'LevelDB directory path')
  .option('-o, --output <file>', 'Output JSON file')
  .action(async (path, options) => {
    try {
      const data = await dumpLevelDb(path);

      if (options.output) {
        await writeJson(options.output, data);
        console.log(chalk.green(`✅ Dumped to: ${options.output}`));
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed:'), error);
      process.exit(1);
    }
  });

// ============================================================================
// Info Command
// ============================================================================

program
  .command('info')
  .description('Show configuration and paths')
  .action(() => {
    console.log(chalk.blue('📋 OneTab Importer Configuration'));
    console.log('');
    console.log(chalk.gray('Default Extension IDs:'));
    console.log(chalk.white(`  Edge:   ${DEFAULT_EXTENSION_IDS.edge}`));
    console.log(chalk.white(`  Chrome: ${DEFAULT_EXTENSION_IDS.chrome}`));
    console.log('');
    console.log(chalk.gray('Default Paths:'));
    console.log(chalk.white(`  Master JSON:  ${DEFAULT_PATHS.masterJson}`));
    console.log(chalk.white(`  Output Dir:   ${DEFAULT_PATHS.outputDir}`));
    console.log(chalk.white(`  LevelDB Copy: ${DEFAULT_PATHS.leveldbCopy}`));
    console.log('');
    console.log(chalk.gray('Browser LevelDB Locations (Windows):'));

    const localAppData = process.env.LOCALAPPDATA ?? '%LOCALAPPDATA%';
    console.log(chalk.white(`  Edge:   ${localAppData}\\Microsoft\\Edge\\User Data\\Default\\Local Extension Settings\\${DEFAULT_EXTENSION_IDS.edge}`));
    console.log(chalk.white(`  Chrome: ${localAppData}\\Google\\Chrome\\User Data\\Default\\Local Extension Settings\\${DEFAULT_EXTENSION_IDS.chrome}`));
  });

// Parse and run
program.parse();
