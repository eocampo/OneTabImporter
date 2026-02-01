/**
 * OneTab Importer - TypeScript Type Definitions
 * 
 * These types match OneTab's internal storage format with timestamps.
 */

// ============================================================================
// OneTab Native Format (from LevelDB/localStorage)
// ============================================================================

/**
 * Individual tab metadata as stored by OneTab
 */
export interface OneTabTabMeta {
  /** Unique identifier for the tab */
  id: string;
  /** Full URL of the tab */
  url: string;
  /** Page title */
  title: string;
}

/**
 * Tab group as stored by OneTab
 */
export interface OneTabGroup {
  /** Unique identifier for the group */
  id: string;
  /** Array of tabs in this group */
  tabsMeta: OneTabTabMeta[];
  /** Creation timestamp in Unix epoch milliseconds */
  createDate: number;
  /** Optional: whether the group is starred/locked */
  starred?: boolean;
  /** Optional: custom title for the group */
  title?: string;
}

/**
 * OneTab's root state object
 */
export interface OneTabState {
  tabGroups: OneTabGroup[];
}

/**
 * Raw export from OneTab (either from localStorage or LevelDB)
 */
export interface OneTabRawExport {
  state?: OneTabState;
  tabGroups?: OneTabGroup[];
}

// ============================================================================
// Master Data Format (normalized for our application)
// ============================================================================

/**
 * Normalized tab entry with ISO timestamp
 */
export interface Tab {
  /** Original OneTab ID */
  id: string;
  /** Full URL */
  url: string;
  /** Page title */
  title: string;
  /** Domain extracted from URL */
  domain: string;
}

/**
 * Normalized tab group with ISO timestamp
 */
export interface TabGroup {
  /** Original OneTab ID */
  id: string;
  /** Tabs in this group */
  tabs: Tab[];
  /** Creation date as ISO 8601 string */
  createdAt: string;
  /** Original Unix epoch milliseconds (preserved for reference) */
  createdAtEpoch: number;
  /** Tab count for quick reference */
  tabCount: number;
  /** Optional: whether the group is starred/locked */
  starred: boolean;
  /** Optional: custom title for the group */
  title?: string;
}

/**
 * Master data file structure
 */
export interface MasterData {
  /** Schema version for future migrations */
  schemaVersion: string;
  /** When this export was created */
  exportedAt: string;
  /** Source browser and extension info */
  source: {
    browser: 'edge' | 'chrome' | 'firefox' | 'unknown';
    extensionId: string;
    extractionMethod: 'devtools' | 'leveldb' | 'import';
  };
  /** Statistics */
  stats: {
    totalGroups: number;
    totalTabs: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
  /** All tab groups */
  groups: TabGroup[];
}

// ============================================================================
// CLI Options
// ============================================================================

export interface ImportOptions {
  /** Input file path (JSON export from DevTools) */
  input?: string;
  /** LevelDB directory path */
  leveldb?: string;
  /** Browser extension ID override */
  extensionId?: string;
  /** Browser type */
  browser?: 'edge' | 'chrome';
  /** Output master JSON path */
  output?: string;
}

export interface ExportOptions {
  /** Master JSON input path */
  input?: string;
  /** Output directory for Markdown files */
  output?: string;
  /** Group by: 'month' | 'week' | 'day' */
  groupBy?: 'month' | 'week' | 'day';
  /** Date range filter: start */
  from?: string;
  /** Date range filter: end */
  to?: string;
}

export interface SearchOptions {
  /** Search query (matches title and URL) */
  query?: string;
  /** URL pattern (regex) */
  urlPattern?: string;
  /** Title pattern (regex) */
  titlePattern?: string;
  /** Domain filter */
  domain?: string;
  /** Date range filter: start */
  from?: string;
  /** Date range filter: end */
  to?: string;
  /** Output format */
  format?: 'console' | 'json' | 'markdown';
  /** Master JSON input path */
  input?: string;
}

// ============================================================================
// Search Results
// ============================================================================

export interface SearchResult {
  /** The tab that matched */
  tab: Tab;
  /** The group containing the tab */
  group: {
    id: string;
    createdAt: string;
    title?: string;
  };
  /** Match details */
  matches: {
    inTitle: boolean;
    inUrl: boolean;
    inDomain: boolean;
  };
}

export interface SearchResults {
  query: string;
  totalResults: number;
  results: SearchResult[];
}

// ============================================================================
// Constants
// ============================================================================

export const SCHEMA_VERSION = '1.0.0';

export const DEFAULT_EXTENSION_IDS = {
  edge: 'hoimpamkkoehapgenciaoajfkfkpgfop',
  chrome: 'chphlpgkkbolifaimnlloiipkdnihall',
} as const;

export const DEFAULT_PATHS = {
  masterJson: './data/master.json',
  outputDir: './output',
  leveldbCopy: './leveldb-copy',
} as const;
