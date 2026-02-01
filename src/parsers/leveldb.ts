/**
 * LevelDB Parser for OneTab data
 * 
 * Extracts OneTab data directly from browser's LevelDB storage
 */

import { ClassicLevel } from 'classic-level';
import { join } from 'path';
import type { MasterData } from '../models/types.js';
import { parseOneTabJson } from './json.js';
import { exists } from '../utils/files.js';

/**
 * Keys used by OneTab in LevelDB storage
 */
const ONETAB_KEYS = [
  'state',
  '_state',
  'tabGroups',
  '_tabGroups',
];

/**
 * Attempt to read and parse a value from LevelDB
 * Returns the value wrapped in an object with the key name
 */
async function tryGetValue(
  db: ClassicLevel<string, string>,
  key: string
): Promise<Record<string, unknown> | null> {
  try {
    const value = await db.get(key);
    if (value) {
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(value);
        // If it's an object, check if it has tabGroups directly
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return { [key]: parsed };
        }
        // Otherwise wrap it
        return { [key]: parsed };
      } catch {
        // Not JSON, return as string
        return { [key]: value };
      }
    }
  } catch (error) {
    // Key not found or parse error, continue
    if ((error as { code?: string }).code !== 'LEVEL_NOT_FOUND') {
      console.warn(`Warning: Error reading key "${key}":`, error);
    }
  }
  return null;
}

/**
 * Scan all keys in the database looking for OneTab data
 */
async function scanForOneTabData(
  db: ClassicLevel<string, string>
): Promise<unknown | null> {
  const results: Record<string, unknown> = {};

  for await (const [key, value] of db.iterator()) {
    // Look for state or tabGroups keys
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('state') ||
      lowerKey.includes('tabgroup') ||
      lowerKey.includes('onetab')
    ) {
      try {
        results[key] = JSON.parse(value);
      } catch {
        // Not JSON, skip
      }
    }
  }

  // Try to construct a valid OneTab export from found data
  if (results['state']) {
    return { state: results['state'] };
  }

  if (results['tabGroups']) {
    return { tabGroups: results['tabGroups'] };
  }

  // Check for nested structures
  for (const value of Object.values(results)) {
    if (
      value &&
      typeof value === 'object' &&
      ('tabGroups' in (value as object) || 'state' in (value as object))
    ) {
      return value;
    }
  }

  return null;
}

/**
 * Parse OneTab data from a LevelDB directory
 */
export async function parseLevelDb(
  levelDbPath: string,
  source: MasterData['source']
): Promise<MasterData> {
  // Verify the path exists
  if (!(await exists(levelDbPath))) {
    throw new Error(`LevelDB path does not exist: ${levelDbPath}`);
  }

  // Check for common LevelDB files
  const currentFile = join(levelDbPath, 'CURRENT');
  if (!(await exists(currentFile))) {
    throw new Error(
      `Invalid LevelDB directory (CURRENT file not found): ${levelDbPath}`
    );
  }

  console.log(`Opening LevelDB at: ${levelDbPath}`);

  // Open the database in read-only mode
  const db = new ClassicLevel<string, string>(levelDbPath, {
    createIfMissing: false,
    errorIfExists: false,
    valueEncoding: 'utf8',
    keyEncoding: 'utf8',
  });

  try {
    await db.open();

    let rawData: unknown = null;

    // Try known keys first
    for (const key of ONETAB_KEYS) {
      rawData = await tryGetValue(db, key);
      if (rawData) {
        console.log(`Found OneTab data in key: "${key}"`);
        break;
      }
    }

    // If not found, scan all keys
    if (!rawData) {
      console.log('Scanning database for OneTab data...');
      rawData = await scanForOneTabData(db);
    }

    if (!rawData) {
      throw new Error(
        'Could not find OneTab data in LevelDB. ' +
        'The database may be empty or use a different format.'
      );
    }

    // Parse the raw data
    return parseOneTabJson(rawData, {
      ...source,
      extractionMethod: 'leveldb',
    });

  } finally {
    await db.close();
  }
}

/**
 * List all keys in a LevelDB database (for debugging)
 */
export async function listLevelDbKeys(levelDbPath: string): Promise<string[]> {
  if (!(await exists(levelDbPath))) {
    throw new Error(`LevelDB path does not exist: ${levelDbPath}`);
  }

  const db = new ClassicLevel<string, string>(levelDbPath, {
    createIfMissing: false,
    errorIfExists: false,
    valueEncoding: 'utf8',
    keyEncoding: 'utf8',
  });

  const keys: string[] = [];

  try {
    await db.open();

    for await (const [key] of db.iterator()) {
      keys.push(key);
    }

  } finally {
    await db.close();
  }

  return keys;
}

/**
 * Dump all key-value pairs from LevelDB (for debugging)
 */
export async function dumpLevelDb(
  levelDbPath: string
): Promise<Record<string, unknown>> {
  if (!(await exists(levelDbPath))) {
    throw new Error(`LevelDB path does not exist: ${levelDbPath}`);
  }

  const db = new ClassicLevel<string, string>(levelDbPath, {
    createIfMissing: false,
    errorIfExists: false,
    valueEncoding: 'utf8',
    keyEncoding: 'utf8',
  });

  const data: Record<string, unknown> = {};

  try {
    await db.open();

    for await (const [key, value] of db.iterator()) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }

  } finally {
    await db.close();
  }

  return data;
}
