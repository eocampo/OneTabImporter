/**
 * Export Command - Export master data to Markdown files
 */

import chalk from 'chalk';
import { resolve, join } from 'path';
import type { ExportOptions, MasterData, TabGroup } from '../models/types.js';
import { DEFAULT_PATHS } from '../models/types.js';
import { readJson, writeText, exists, ensureDir } from '../utils/files.js';
import {
  getYearMonth,
  getYearWeek,
  getDateOnly,
  formatDateForHeader,
  isDateInRange,
  parseFlexibleDate,
} from '../utils/dates.js';

/**
 * Group tabs by a date period
 */
function groupByPeriod(
  groups: TabGroup[],
  groupBy: 'month' | 'week' | 'day'
): Map<string, TabGroup[]> {
  const periodMap = new Map<string, TabGroup[]>();

  for (const group of groups) {
    let periodKey: string;

    switch (groupBy) {
      case 'month':
        periodKey = getYearMonth(group.createdAt);
        break;
      case 'week':
        periodKey = getYearWeek(group.createdAt);
        break;
      case 'day':
        periodKey = getDateOnly(group.createdAt);
        break;
    }

    const existing = periodMap.get(periodKey) ?? [];
    existing.push(group);
    periodMap.set(periodKey, existing);
  }

  return periodMap;
}

/**
 * Generate Markdown content for a group of tabs
 */
function generateGroupMarkdown(group: TabGroup): string {
  const lines: string[] = [];

  // Group header with timestamp
  const dateStr = formatDateForHeader(group.createdAt);
  const title = group.title ? ` - ${group.title}` : '';
  const starred = group.starred ? ' ⭐' : '';

  lines.push(`### ${dateStr}${title}${starred}`);
  lines.push('');

  // Tabs as bullet list with links
  for (const tab of group.tabs) {
    const title = tab.title || tab.domain;
    lines.push(`- [${title}](${tab.url})`);
  }

  lines.push('');

  return lines.join('\n');
}

/**
 * Generate Markdown file for a period
 */
function generatePeriodMarkdown(
  periodKey: string,
  groups: TabGroup[],
  groupBy: 'month' | 'week' | 'day'
): string {
  const lines: string[] = [];

  // YAML frontmatter
  lines.push('---');
  lines.push(`period: "${periodKey}"`);
  lines.push(`groupBy: "${groupBy}"`);
  lines.push(`totalGroups: ${groups.length}`);
  lines.push(`totalTabs: ${groups.reduce((sum, g) => sum + g.tabCount, 0)}`);
  lines.push(`generated: "${new Date().toISOString()}"`);
  lines.push('---');
  lines.push('');

  // Title
  lines.push(`# OneTab Links: ${periodKey}`);
  lines.push('');

  // Summary
  lines.push(`> **${groups.length}** tab groups, **${groups.reduce((sum, g) => sum + g.tabCount, 0)}** total links`);
  lines.push('');

  // Sort groups by date (newest first)
  const sortedGroups = [...groups].sort(
    (a, b) => b.createdAtEpoch - a.createdAtEpoch
  );

  // Generate content for each group
  for (const group of sortedGroups) {
    lines.push(generateGroupMarkdown(group));
  }

  return lines.join('\n');
}

/**
 * Get output file path for a period
 */
function getOutputPath(
  outputDir: string,
  periodKey: string,
  groupBy: 'month' | 'week' | 'day'
): string {
  const year = periodKey.substring(0, 4);

  switch (groupBy) {
    case 'month':
      return join(outputDir, year, `${periodKey}.md`);
    case 'week':
      return join(outputDir, year, `${periodKey}.md`);
    case 'day':
      return join(outputDir, year, periodKey.substring(0, 7), `${periodKey}.md`);
  }
}

/**
 * Execute the export command
 */
export async function exportCommand(options: ExportOptions): Promise<void> {
  console.log(chalk.blue('📝 OneTab Export to Markdown'));
  console.log('');

  const inputPath = resolve(options.input ?? DEFAULT_PATHS.masterJson);
  const outputDir = resolve(options.output ?? DEFAULT_PATHS.outputDir);
  const groupBy = options.groupBy ?? 'month';

  // Check input exists
  if (!(await exists(inputPath))) {
    console.error(chalk.red(`❌ Master data not found: ${inputPath}`));
    console.log(chalk.yellow('\n💡 Run import first:'));
    console.log(chalk.gray('   onetab import --input your-export.json'));
    process.exit(1);
  }

  // Load master data
  console.log(chalk.gray(`📂 Loading from: ${inputPath}`));
  const masterData = await readJson<MasterData>(inputPath);

  // Filter by date range if specified
  let filteredGroups = masterData.groups;

  if (options.from || options.to) {
    const fromDate = options.from ? parseFlexibleDate(options.from) : undefined;
    const toDate = options.to ? parseFlexibleDate(options.to, true) : undefined;

    filteredGroups = masterData.groups.filter((group) =>
      isDateInRange(group.createdAt, fromDate, toDate)
    );

    console.log(
      chalk.gray(
        `📅 Filtered to date range: ${options.from ?? 'start'} to ${options.to ?? 'now'}`
      )
    );
    console.log(chalk.gray(`   ${filteredGroups.length} groups match`));
  }

  if (filteredGroups.length === 0) {
    console.log(chalk.yellow('⚠️  No groups to export'));
    return;
  }

  // Group by period
  const periodMap = groupByPeriod(filteredGroups, groupBy);
  console.log(chalk.gray(`📊 Grouped into ${periodMap.size} ${groupBy}(s)`));

  // Ensure output directory
  await ensureDir(outputDir);

  // Generate and write files
  let filesWritten = 0;

  for (const [periodKey, groups] of periodMap) {
    const markdown = generatePeriodMarkdown(periodKey, groups, groupBy);
    const filePath = getOutputPath(outputDir, periodKey, groupBy);

    await writeText(filePath, markdown);
    filesWritten++;

    console.log(chalk.gray(`   📄 ${filePath}`));
  }

  console.log('');
  console.log(chalk.green(`✅ Exported ${filesWritten} Markdown file(s) to: ${outputDir}`));

  // Print summary
  console.log('');
  console.log(chalk.blue('📊 Summary:'));
  console.log(chalk.gray(`   Groups exported: ${filteredGroups.length}`));
  console.log(chalk.gray(`   Tabs exported:   ${filteredGroups.reduce((sum, g) => sum + g.tabCount, 0)}`));
  console.log(chalk.gray(`   Files created:   ${filesWritten}`));
  console.log(chalk.gray(`   Grouped by:      ${groupBy}`));
}

/**
 * Generate a single consolidated Markdown file
 */
export async function exportSingleFile(options: ExportOptions): Promise<void> {
  const inputPath = resolve(options.input ?? DEFAULT_PATHS.masterJson);
  const outputPath = resolve(options.output ?? join(DEFAULT_PATHS.outputDir, 'all-links.md'));

  if (!(await exists(inputPath))) {
    console.error(chalk.red(`❌ Master data not found: ${inputPath}`));
    process.exit(1);
  }

  const masterData = await readJson<MasterData>(inputPath);

  const lines: string[] = [];

  // YAML frontmatter
  lines.push('---');
  lines.push(`title: "OneTab Links Export"`);
  lines.push(`totalGroups: ${masterData.stats.totalGroups}`);
  lines.push(`totalTabs: ${masterData.stats.totalTabs}`);
  lines.push(`dateRange: "${masterData.stats.dateRange.earliest.substring(0, 10)} to ${masterData.stats.dateRange.latest.substring(0, 10)}"`);
  lines.push(`generated: "${new Date().toISOString()}"`);
  lines.push('---');
  lines.push('');

  lines.push('# OneTab Links Export');
  lines.push('');
  lines.push(`> **${masterData.stats.totalGroups}** groups, **${masterData.stats.totalTabs}** tabs`);
  lines.push(`> From ${masterData.stats.dateRange.earliest.substring(0, 10)} to ${masterData.stats.dateRange.latest.substring(0, 10)}`);
  lines.push('');

  // Group by month for organization
  const byMonth = groupByPeriod(masterData.groups, 'month');
  const sortedMonths = Array.from(byMonth.keys()).sort().reverse();

  for (const month of sortedMonths) {
    const groups = byMonth.get(month)!;
    lines.push(`## ${month}`);
    lines.push('');

    for (const group of groups) {
      lines.push(generateGroupMarkdown(group));
    }
  }

  await writeText(outputPath, lines.join('\n'));
  console.log(chalk.green(`✅ Exported to: ${outputPath}`));
}
