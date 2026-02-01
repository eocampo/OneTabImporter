/**
 * JSON Parser for OneTab data
 * 
 * Handles parsing and validation of OneTab exports from DevTools console
 */

import type {
  OneTabGroup,
  MasterData,
  TabGroup,
  Tab,
} from '../models/types.js';
import { SCHEMA_VERSION } from '../models/types.js';
import { epochToIso, nowIso } from '../utils/dates.js';
import { extractDomain } from '../utils/files.js';

/**
 * Validate that an object is a valid OneTab tab
 */
function isValidTab(obj: unknown): obj is { id: string; url: string; title: string } {
  if (!obj || typeof obj !== 'object') return false;
  const tab = obj as Record<string, unknown>;
  return (
    typeof tab.id === 'string' &&
    typeof tab.url === 'string' &&
    typeof tab.title === 'string'
  );
}

/**
 * Validate that an object is a valid OneTab group
 */
function isValidGroup(obj: unknown): obj is OneTabGroup {
  if (!obj || typeof obj !== 'object') return false;
  const group = obj as Record<string, unknown>;
  return (
    typeof group.id === 'string' &&
    typeof group.createDate === 'number' &&
    Array.isArray(group.tabsMeta) &&
    group.tabsMeta.every(isValidTab)
  );
}

/**
 * Validate OneTab raw export structure
 */
export function validateOneTabExport(data: unknown): OneTabGroup[] {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid OneTab export: expected an object');
  }

  let obj = data as Record<string, unknown>;

  // Handle state being a string (double-encoded JSON from LevelDB)
  if (typeof obj.state === 'string') {
    try {
      obj = { ...obj, state: JSON.parse(obj.state as string) };
    } catch {
      throw new Error('Invalid OneTab export: state is a string but not valid JSON');
    }
  }

  // Handle direct state object
  if (obj.state && typeof obj.state === 'object') {
    let state = obj.state as Record<string, unknown>;

    // Handle tabGroups being a string (double-encoded)
    if (typeof state.tabGroups === 'string') {
      try {
        state = { ...state, tabGroups: JSON.parse(state.tabGroups as string) };
      } catch {
        throw new Error('Invalid OneTab export: tabGroups is a string but not valid JSON');
      }
    }

    if (Array.isArray(state.tabGroups)) {
      if (!state.tabGroups.every(isValidGroup)) {
        throw new Error('Invalid OneTab export: tabGroups contains invalid entries');
      }
      return state.tabGroups as OneTabGroup[];
    }
  }

  // Handle tabGroups being a string at top level
  if (typeof obj.tabGroups === 'string') {
    try {
      obj = { ...obj, tabGroups: JSON.parse(obj.tabGroups as string) };
    } catch {
      throw new Error('Invalid OneTab export: tabGroups is a string but not valid JSON');
    }
  }

  // Handle direct tabGroups array
  if (Array.isArray(obj.tabGroups)) {
    if (!obj.tabGroups.every(isValidGroup)) {
      throw new Error('Invalid OneTab export: tabGroups contains invalid entries');
    }
    return obj.tabGroups as OneTabGroup[];
  }

  // Handle if the object itself is the state
  if ('tabGroups' in obj && Array.isArray(obj.tabGroups)) {
    const groups = obj.tabGroups as unknown[];
    if (!groups.every(isValidGroup)) {
      throw new Error('Invalid OneTab export: tabGroups contains invalid entries');
    }
    return groups as OneTabGroup[];
  }

  throw new Error(
    'Invalid OneTab export: could not find tabGroups array. ' +
    'Expected { state: { tabGroups: [...] } } or { tabGroups: [...] }'
  );
}

/**
 * Transform a OneTab group to our normalized format
 */
function transformGroup(group: OneTabGroup): TabGroup {
  const createdAt = epochToIso(group.createDate);

  const tabs: Tab[] = group.tabsMeta.map((tab) => ({
    id: tab.id,
    url: tab.url,
    title: tab.title || extractDomain(tab.url),
    domain: extractDomain(tab.url),
  }));

  return {
    id: group.id,
    tabs,
    createdAt,
    createdAtEpoch: group.createDate,
    tabCount: tabs.length,
    starred: group.starred ?? false,
    title: group.title,
  };
}

/**
 * Parse OneTab JSON export and convert to MasterData format
 */
export function parseOneTabJson(
  rawData: unknown,
  source: MasterData['source']
): MasterData {
  const oneTabGroups = validateOneTabExport(rawData);

  // Transform to our format
  const groups = oneTabGroups.map(transformGroup);

  // Sort by date (newest first)
  groups.sort((a, b) => b.createdAtEpoch - a.createdAtEpoch);

  // Calculate stats
  const totalTabs = groups.reduce((sum, g) => sum + g.tabCount, 0);
  const dates = groups.map((g) => g.createdAt).sort();

  const masterData: MasterData = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowIso(),
    source,
    stats: {
      totalGroups: groups.length,
      totalTabs,
      dateRange: {
        earliest: dates[0] ?? nowIso(),
        latest: dates[dates.length - 1] ?? nowIso(),
      },
    },
    groups,
  };

  return masterData;
}

/**
 * Merge new groups into existing master data (deduplicates by group ID)
 */
export function mergeMasterData(
  existing: MasterData,
  newData: MasterData
): MasterData {
  const existingIds = new Set(existing.groups.map((g) => g.id));

  // Add new groups that don't exist
  const newGroups = newData.groups.filter((g) => !existingIds.has(g.id));
  const allGroups = [...existing.groups, ...newGroups];

  // Sort by date (newest first)
  allGroups.sort((a, b) => b.createdAtEpoch - a.createdAtEpoch);

  // Recalculate stats
  const totalTabs = allGroups.reduce((sum, g) => sum + g.tabCount, 0);
  const dates = allGroups.map((g) => g.createdAt).sort();

  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowIso(),
    source: newData.source, // Use newer source info
    stats: {
      totalGroups: allGroups.length,
      totalTabs,
      dateRange: {
        earliest: dates[0] ?? nowIso(),
        latest: dates[dates.length - 1] ?? nowIso(),
      },
    },
    groups: allGroups,
  };
}
