/**
 * File I/O utilities for OneTab Importer
 */

import { mkdir, readFile, writeFile, access, readdir, stat } from 'fs/promises';
import { dirname, join } from 'path';
import { constants } from 'fs';

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory already exists, ignore
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Ensure parent directory of a file exists
 */
export async function ensureParentDir(filePath: string): Promise<void> {
  await ensureDir(dirname(filePath));
}

/**
 * Check if a file or directory exists
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a JSON file and parse it
 */
export async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Write an object as JSON to a file
 */
export async function writeJson<T>(filePath: string, data: T, pretty = true): Promise<void> {
  await ensureParentDir(filePath);
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  await writeFile(filePath, content, 'utf-8');
}

/**
 * Read a text file
 */
export async function readText(filePath: string): Promise<string> {
  return await readFile(filePath, 'utf-8');
}

/**
 * Write a text file
 */
export async function writeText(filePath: string, content: string): Promise<void> {
  await ensureParentDir(filePath);
  await writeFile(filePath, content, 'utf-8');
}

/**
 * List files in a directory (non-recursive)
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stats = await stat(fullPath);
    if (stats.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * List directories in a directory (non-recursive)
 */
export async function listDirs(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath);
  const dirs: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stats = await stat(fullPath);
    if (stats.isDirectory()) {
      dirs.push(fullPath);
    }
  }

  return dirs;
}

/**
 * Get the default LevelDB path for a browser
 */
export function getDefaultLevelDbPath(
  browser: 'edge' | 'chrome',
  extensionId: string,
  profile = 'Default'
): string {
  const localAppData = process.env.LOCALAPPDATA;

  if (!localAppData) {
    throw new Error('LOCALAPPDATA environment variable not set');
  }

  const browserPaths = {
    edge: join(localAppData, 'Microsoft', 'Edge', 'User Data'),
    chrome: join(localAppData, 'Google', 'Chrome', 'User Data'),
  };

  return join(browserPaths[browser], profile, 'Local Extension Settings', extensionId);
}

/**
 * Extract domain from a URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    // If URL parsing fails, try to extract manually
    const match = url.match(/^(?:https?:\/\/)?([^:/]+)/);
    return match?.[1] ?? 'unknown';
  }
}
