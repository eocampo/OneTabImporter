# Coding Standards

## Table of Contents

- [TypeScript Guidelines](#typescript-guidelines)
- [Code Style](#code-style)
- [Naming Conventions](#naming-conventions)
- [Error Handling](#error-handling)
- [Console Output](#console-output)
- [Documentation](#documentation)
- [Best Practices](#best-practices)

---

## TypeScript Guidelines

### Strict Mode

The project uses TypeScript strict mode. All strict checks are enabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**This means**:
- All variables must have explicit or inferred types
- No implicit `any` types
- Null/undefined must be explicitly handled
- All code paths must return a value
- Switch statements need break/return

### Type Annotations

**When to annotate**:
- Function parameters: Always
- Function return types: Always for exported functions
- Variables: Only when not inferable

```typescript
// ✅ Good - explicit parameter and return types
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

// ✅ Good - type is inferred
const groups = masterData.groups;

// ❌ Avoid - unnecessary annotation
const count: number = groups.length;
```

### Use `interface` over `type`

Prefer `interface` for object shapes:

```typescript
// ✅ Preferred
interface User {
  id: string;
  name: string;
}

// ⚠️ Use type for unions/intersections
type Browser = 'edge' | 'chrome' | 'firefox';
```

### Handle Unknown Types

When parsing JSON or external data:

```typescript
// ✅ Good - validate unknown data
function isValidGroup(obj: unknown): obj is OneTabGroup {
  if (!obj || typeof obj !== 'object') return false;
  const group = obj as Record<string, unknown>;
  return typeof group.id === 'string';
}

// ❌ Avoid - casting without validation
const group = data as OneTabGroup;
```

---

## Code Style

### Formatting

The project doesn't enforce a specific formatter, but follow these guidelines:

| Aspect | Style |
|--------|-------|
| Indentation | 2 spaces |
| Quotes | Single quotes for strings |
| Semicolons | Required |
| Line length | ~100 characters (soft limit) |
| Trailing commas | Yes, in multi-line |

```typescript
// ✅ Good
const options = {
  input: './data/master.json',
  output: './output',
  groupBy: 'month',
};

// ❌ Avoid
const options = {
    input: "./data/master.json"
    , output: "./output"
}
```

### Imports

Order imports logically:

```typescript
// 1. Node.js built-ins
import { resolve, join } from 'path';

// 2. External packages
import { Command } from 'commander';
import chalk from 'chalk';

// 3. Internal modules - types
import type { MasterData, ImportOptions } from '../models/types.js';

// 4. Internal modules - values
import { parseOneTabJson } from '../parsers/json.js';
import { readJson, writeJson } from '../utils/files.js';
```

### Use Type-Only Imports

When importing only types:

```typescript
// ✅ Good - explicit type import
import type { MasterData, TabGroup } from '../models/types.js';
import { SCHEMA_VERSION, DEFAULT_PATHS } from '../models/types.js';

// ⚠️ Avoid mixing when you only need types
import { MasterData, TabGroup } from '../models/types.js';
```

---

## Naming Conventions

### Variables and Functions

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `const masterData = ...` |
| Functions | camelCase | `function parseOneTabJson()` |
| Boolean vars | is/has/can prefix | `const isValid = true` |
| Constants | SCREAMING_SNAKE | `const SCHEMA_VERSION = '1.0.0'` |

### Files and Directories

| Type | Convention | Example |
|------|------------|---------|
| Source files | lowercase | `import.ts`, `leveldb.ts` |
| Directories | lowercase | `commands/`, `utils/` |
| Config files | lowercase | `tsconfig.json` |

### Interfaces and Types

| Type | Convention | Example |
|------|------------|---------|
| Interfaces | PascalCase | `interface MasterData` |
| Type aliases | PascalCase | `type Browser = 'edge' \| 'chrome'` |
| Generics | Single letter | `function parse<T>(data: T)` |

---

## Error Handling

### Use Try-Catch for Async

```typescript
// ✅ Good - async error handling
export async function importCommand(options: ImportOptions): Promise<void> {
  try {
    const data = await readJson(options.input);
    // ...
  } catch (error) {
    console.error(chalk.red('❌ Import failed:'), error);
    process.exit(1);
  }
}
```

### Throw Descriptive Errors

```typescript
// ✅ Good - descriptive error
if (!data.tabGroups) {
  throw new Error(
    'Invalid OneTab export: could not find tabGroups array. ' +
    'Expected { state: { tabGroups: [...] } }'
  );
}

// ❌ Avoid - vague error
if (!data.tabGroups) {
  throw new Error('Invalid data');
}
```

### Type Narrowing for Errors

```typescript
// ✅ Good - handle error type
try {
  await db.open();
} catch (error) {
  if ((error as { code?: string }).code === 'LEVEL_NOT_FOUND') {
    // Handle specific error
  }
  throw error;
}
```

---

## Console Output

### Use Chalk for Colors

The project uses `chalk` for consistent terminal output:

```typescript
import chalk from 'chalk';

// Status messages
console.log(chalk.blue('🔄 Starting import...'));
console.log(chalk.green('✅ Import successful'));
console.log(chalk.yellow('⚠️  Warning: No groups found'));
console.log(chalk.red('❌ Error: File not found'));

// Informational
console.log(chalk.gray('📂 Reading from: ./data/master.json'));
console.log(chalk.gray(`   Total: ${count} items`));
```

### Color Conventions

| Color | Usage | Emoji |
|-------|-------|-------|
| Blue | Starting/info headers | 🔄 📋 🔍 |
| Green | Success | ✅ 💾 |
| Yellow | Warnings | ⚠️ |
| Red | Errors | ❌ |
| Gray | Details, paths, secondary info | 📂 |
| White | User data, important values | — |

### Progress Feedback

```typescript
// Show progress for long operations
console.log(chalk.gray(`📂 Loading from: ${inputPath}`));
// ... operation ...
console.log(chalk.green(`✅ Parsed ${groups.length} groups`));
```

---

## Documentation

### File Headers

Each source file should have a header comment:

```typescript
/**
 * Import Command - Import OneTab data from JSON or LevelDB
 * 
 * This module handles importing tab data from various sources and
 * converting it to the normalized MasterData format.
 */
```

### Function Documentation

Document exported functions:

```typescript
/**
 * Parse OneTab JSON export and convert to MasterData format
 * 
 * @param rawData - Raw JSON data from OneTab export
 * @param source - Metadata about the data source
 * @returns Normalized MasterData object
 * @throws Error if data structure is invalid
 */
export function parseOneTabJson(
  rawData: unknown,
  source: MasterData['source']
): MasterData {
  // ...
}
```

### Inline Comments

Use sparingly for complex logic:

```typescript
// Handle double-encoded JSON (OneTab sometimes stringifies twice)
if (typeof state.tabGroups === 'string') {
  state = { ...state, tabGroups: JSON.parse(state.tabGroups as string) };
}
```

---

## Best Practices

### Prefer Pure Functions

```typescript
// ✅ Good - pure function
function transformGroup(group: OneTabGroup): TabGroup {
  return {
    id: group.id,
    tabs: group.tabsMeta.map(transformTab),
    // ...
  };
}

// ⚠️ Avoid - side effects
function transformGroup(group: OneTabGroup): TabGroup {
  console.log('Transforming group...'); // Side effect
  globalCounter++; // Side effect
  return { /* ... */ };
}
```

### Use Early Returns

```typescript
// ✅ Good - early returns
function validateInput(options: ImportOptions): boolean {
  if (!options.input && !options.leveldb) {
    console.error('No input specified');
    return false;
  }
  
  if (options.input && !existsSync(options.input)) {
    console.error('Input file not found');
    return false;
  }
  
  return true;
}

// ❌ Avoid - deep nesting
function validateInput(options: ImportOptions): boolean {
  if (options.input || options.leveldb) {
    if (!options.input || existsSync(options.input)) {
      return true;
    }
  }
  return false;
}
```

### Avoid Magic Numbers

```typescript
// ✅ Good
const MAX_RESULTS_TO_DISPLAY = 50;
const results = sorted.slice(0, MAX_RESULTS_TO_DISPLAY);

// ❌ Avoid
const results = sorted.slice(0, 50);
```

### Prefer const

```typescript
// ✅ Good
const groups = masterData.groups;
const results = groups.filter(g => g.starred);

// ⚠️ Only use let when reassignment needed
let count = 0;
for (const group of groups) {
  count += group.tabs.length;
}
```

### Use Optional Chaining

```typescript
// ✅ Good
const title = group.title ?? 'Untitled';
const domain = tab.domain?.toLowerCase();

// ❌ Avoid
const title = group.title ? group.title : 'Untitled';
const domain = tab.domain && tab.domain.toLowerCase();
```

---

## Related Documentation

- [Code Structure](./CODE_STRUCTURE.md) — File organization
- [Workflows](./WORKFLOWS.md) — Git workflow
- [Tech Stack](../overview/TECH_STACK.md) — Technologies used
