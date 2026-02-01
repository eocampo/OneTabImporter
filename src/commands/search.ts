/**
 * Search Command - Search through OneTab data
 */

import chalk from 'chalk';
import { resolve } from 'path';
import type {
  SearchOptions,
  MasterData,
  SearchResult,
  SearchResults,
  Tab,
} from '../models/types.js';
import { DEFAULT_PATHS } from '../models/types.js';
import { readJson, writeJson, writeText, exists } from '../utils/files.js';
import { isDateInRange, parseFlexibleDate } from '../utils/dates.js';

/**
 * Check if a tab matches the search criteria
 */
function matchesTab(
  tab: Tab,
  options: SearchOptions
): { matches: boolean; inTitle: boolean; inUrl: boolean; inDomain: boolean } {
  let inTitle = false;
  let inUrl = false;
  let inDomain = false;

  // General query search
  if (options.query) {
    const query = options.query.toLowerCase();
    inTitle = tab.title.toLowerCase().includes(query);
    inUrl = tab.url.toLowerCase().includes(query);
    inDomain = tab.domain.toLowerCase().includes(query);
  }

  // Title pattern (regex)
  if (options.titlePattern) {
    try {
      const regex = new RegExp(options.titlePattern, 'i');
      inTitle = inTitle || regex.test(tab.title);
    } catch {
      console.warn(chalk.yellow(`⚠️  Invalid title regex: ${options.titlePattern}`));
    }
  }

  // URL pattern (regex)
  if (options.urlPattern) {
    try {
      const regex = new RegExp(options.urlPattern, 'i');
      inUrl = inUrl || regex.test(tab.url);
    } catch {
      console.warn(chalk.yellow(`⚠️  Invalid URL regex: ${options.urlPattern}`));
    }
  }

  // Domain filter (exact or partial match)
  if (options.domain) {
    const domain = options.domain.toLowerCase();
    inDomain = inDomain || tab.domain.toLowerCase().includes(domain);
  }

  const matches = inTitle || inUrl || inDomain;
  return { matches, inTitle, inUrl, inDomain };
}

/**
 * Search through all groups and tabs
 */
function searchData(
  masterData: MasterData,
  options: SearchOptions
): SearchResult[] {
  const results: SearchResult[] = [];

  // Parse date filters
  const fromDate = options.from ? parseFlexibleDate(options.from) : undefined;
  const toDate = options.to ? parseFlexibleDate(options.to, true) : undefined;

  for (const group of masterData.groups) {
    // Check date range filter
    if (!isDateInRange(group.createdAt, fromDate, toDate)) {
      continue;
    }

    for (const tab of group.tabs) {
      const match = matchesTab(tab, options);

      if (match.matches) {
        results.push({
          tab,
          group: {
            id: group.id,
            createdAt: group.createdAt,
            title: group.title,
          },
          matches: {
            inTitle: match.inTitle,
            inUrl: match.inUrl,
            inDomain: match.inDomain,
          },
        });
      }
    }
  }

  return results;
}

/**
 * Format search results for console output
 */
function formatResultsForConsole(results: SearchResult[]): string {
  if (results.length === 0) {
    return chalk.yellow('No matches found.');
  }

  const lines: string[] = [];

  // Group results by date for display
  const byDate = new Map<string, SearchResult[]>();

  for (const result of results) {
    const date = result.group.createdAt.substring(0, 10);
    const existing = byDate.get(date) ?? [];
    existing.push(result);
    byDate.set(date, existing);
  }

  const sortedDates = Array.from(byDate.keys()).sort().reverse();

  for (const date of sortedDates) {
    const dateResults = byDate.get(date)!;
    lines.push(chalk.blue(`\n📅 ${date}`));

    for (const result of dateResults) {
      const matchInfo: string[] = [];
      if (result.matches.inTitle) matchInfo.push('title');
      if (result.matches.inUrl) matchInfo.push('url');
      if (result.matches.inDomain) matchInfo.push('domain');

      lines.push(
        chalk.white(`  • ${result.tab.title}`) +
        chalk.gray(` [${result.tab.domain}]`) +
        chalk.dim(` (${matchInfo.join(', ')})`)
      );
      lines.push(chalk.gray(`    ${result.tab.url}`));
    }
  }

  return lines.join('\n');
}

/**
 * Format search results as Markdown
 */
function formatResultsAsMarkdown(
  results: SearchResult[],
  query: string
): string {
  const lines: string[] = [];

  lines.push('---');
  lines.push(`query: "${query}"`);
  lines.push(`results: ${results.length}`);
  lines.push(`generated: "${new Date().toISOString()}"`);
  lines.push('---');
  lines.push('');
  lines.push(`# Search Results: "${query}"`);
  lines.push('');
  lines.push(`> Found **${results.length}** matching links`);
  lines.push('');

  // Group by date
  const byDate = new Map<string, SearchResult[]>();

  for (const result of results) {
    const date = result.group.createdAt.substring(0, 10);
    const existing = byDate.get(date) ?? [];
    existing.push(result);
    byDate.set(date, existing);
  }

  const sortedDates = Array.from(byDate.keys()).sort().reverse();

  for (const date of sortedDates) {
    const dateResults = byDate.get(date)!;
    lines.push(`## ${date}`);
    lines.push('');

    for (const result of dateResults) {
      lines.push(`- [${result.tab.title}](${result.tab.url})`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Execute the search command
 */
export async function searchCommand(options: SearchOptions): Promise<void> {
  console.log(chalk.blue('🔍 OneTab Search'));
  console.log('');

  const inputPath = resolve(options.input ?? DEFAULT_PATHS.masterJson);
  const format = options.format ?? 'console';

  // Build query description
  const queryParts: string[] = [];
  if (options.query) queryParts.push(`query: "${options.query}"`);
  if (options.urlPattern) queryParts.push(`URL: /${options.urlPattern}/`);
  if (options.titlePattern) queryParts.push(`title: /${options.titlePattern}/`);
  if (options.domain) queryParts.push(`domain: ${options.domain}`);
  if (options.from) queryParts.push(`from: ${options.from}`);
  if (options.to) queryParts.push(`to: ${options.to}`);

  if (queryParts.length === 0) {
    console.error(chalk.red('❌ No search criteria specified'));
    console.log(chalk.yellow('\nExamples:'));
    console.log(chalk.gray('  onetab search --query "github"'));
    console.log(chalk.gray('  onetab search --domain "stackoverflow.com"'));
    console.log(chalk.gray('  onetab search --url-pattern "youtube\\.com/watch"'));
    console.log(chalk.gray('  onetab search --query "react" --from 2025-01'));
    process.exit(1);
  }

  console.log(chalk.gray(`Search: ${queryParts.join(', ')}`));

  // Check input exists
  if (!(await exists(inputPath))) {
    console.error(chalk.red(`❌ Master data not found: ${inputPath}`));
    console.log(chalk.yellow('\n💡 Run import first:'));
    console.log(chalk.gray('   onetab import --input your-export.json'));
    process.exit(1);
  }

  // Load and search
  const masterData = await readJson<MasterData>(inputPath);
  const results = searchData(masterData, options);

  console.log(chalk.green(`✅ Found ${results.length} matches`));
  console.log('');

  // Output based on format
  const queryStr = options.query ?? options.domain ?? options.urlPattern ?? 'search';

  switch (format) {
    case 'console':
      console.log(formatResultsForConsole(results));
      break;

    case 'json': {
      const searchResults: SearchResults = {
        query: queryStr,
        totalResults: results.length,
        results,
      };
      const outputPath = `search-results-${Date.now()}.json`;
      await writeJson(outputPath, searchResults);
      console.log(chalk.green(`💾 Saved to: ${outputPath}`));
      break;
    }

    case 'markdown': {
      const markdown = formatResultsAsMarkdown(results, queryStr);
      const outputPath = `search-results-${Date.now()}.md`;
      await writeText(outputPath, markdown);
      console.log(chalk.green(`💾 Saved to: ${outputPath}`));
      break;
    }
  }
}

/**
 * List all unique domains in the data
 */
export async function listDomainsCommand(inputPath?: string): Promise<void> {
  const masterJsonPath = resolve(inputPath ?? DEFAULT_PATHS.masterJson);

  if (!(await exists(masterJsonPath))) {
    console.error(chalk.red(`❌ Master data not found: ${masterJsonPath}`));
    process.exit(1);
  }

  const masterData = await readJson<MasterData>(masterJsonPath);

  const domainCounts = new Map<string, number>();

  for (const group of masterData.groups) {
    for (const tab of group.tabs) {
      const count = domainCounts.get(tab.domain) ?? 0;
      domainCounts.set(tab.domain, count + 1);
    }
  }

  // Sort by count
  const sorted = Array.from(domainCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  console.log(chalk.blue('📊 Top Domains'));
  console.log('');

  for (const [domain, count] of sorted.slice(0, 50)) {
    const bar = '█'.repeat(Math.min(count, 30));
    console.log(
      chalk.white(`${count.toString().padStart(4)} `) +
      chalk.cyan(bar) +
      chalk.gray(` ${domain}`)
    );
  }

  if (sorted.length > 50) {
    console.log(chalk.gray(`\n... and ${sorted.length - 50} more domains`));
  }

  console.log('');
  console.log(chalk.gray(`Total unique domains: ${sorted.length}`));
}
