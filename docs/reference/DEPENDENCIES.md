# Dependencies

## Table of Contents

- [Overview](#overview)
- [Production Dependencies](#production-dependencies)
- [Development Dependencies](#development-dependencies)
- [Dependency Management](#dependency-management)

---

## Overview

OneTab Importer uses a minimal set of dependencies, chosen for reliability and simplicity.

```json
{
  "dependencies": {
    "classic-level": "^1.4.1",
    "commander": "^12.1.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3"
  }
}
```

---

## Production Dependencies

### Commander.js

| Property | Value |
|----------|-------|
| **Package** | `commander` |
| **Version** | ^12.1.0 |
| **Purpose** | CLI framework |
| **Website** | https://github.com/tj/commander.js |

**What it does**:
Commander.js is a complete solution for building command-line interfaces in Node.js. It handles:
- Command definition and parsing
- Option parsing (flags like `--input`)
- Automatic help generation
- Version display

**How we use it**:

```typescript
// src/cli.ts
import { Command } from 'commander';

const program = new Command();

program
  .name('onetab')
  .description('Import and manage OneTab links with timestamps')
  .version('1.0.0');

program
  .command('import')
  .description('Import OneTab data from JSON export or LevelDB')
  .option('-i, --input <path>', 'JSON file from DevTools export')
  .option('-l, --leveldb <path>', 'LevelDB directory path')
  .option('-b, --browser <browser>', 'Browser type: edge | chrome', 'edge')
  .action(async (options) => {
    await importCommand(options);
  });

program.parse();
```

**Key features used**:
- `.command()` — Define commands and subcommands
- `.option()` — Define command-line options
- `.action()` — Handler function for the command
- `.description()` — Help text
- `.argument()` — Positional arguments

**Why we chose it**:
- Most popular CLI library for Node.js
- Excellent TypeScript support
- Automatic help generation
- Simple, declarative API

---

### Classic-Level

| Property | Value |
|----------|-------|
| **Package** | `classic-level` |
| **Version** | ^1.4.1 |
| **Purpose** | LevelDB database reading |
| **Website** | https://github.com/Level/classic-level |

**What it does**:
Classic-Level is a LevelDB binding for Node.js. It allows reading and writing LevelDB databases—the format used by Chromium browsers to store extension data.

**How we use it**:

```typescript
// src/parsers/leveldb.ts
import { ClassicLevel } from 'classic-level';

const db = new ClassicLevel<string, string>(levelDbPath, {
  createIfMissing: false,
  errorIfExists: false,
  valueEncoding: 'utf8',
  keyEncoding: 'utf8',
});

try {
  await db.open();
  
  // Read a specific key
  const state = await db.get('state');
  
  // Or iterate all keys
  for await (const [key, value] of db.iterator()) {
    console.log(key, value);
  }
  
} finally {
  await db.close();
}
```

**Key features used**:
- `new ClassicLevel()` — Open a database
- `.get(key)` — Read a value
- `.iterator()` — Iterate all key-value pairs
- `.open()` / `.close()` — Lifecycle management

**Why we chose it**:
- Maintained fork of the original `level` package
- Compatible with Chromium's LevelDB format
- Supports both reading and writing
- Good async/await API

**Note on native modules**:
Classic-Level includes native C++ bindings. This means:
- Requires compilation during `npm install`
- May need build tools (Visual Studio Build Tools on Windows, Xcode on macOS)
- Platform-specific binaries

---

### Chalk

| Property | Value |
|----------|-------|
| **Package** | `chalk` |
| **Version** | ^5.3.0 |
| **Purpose** | Terminal string styling |
| **Website** | https://github.com/chalk/chalk |

**What it does**:
Chalk adds colors and styles to terminal output. It makes CLI output more readable and professional.

**How we use it**:

```typescript
// Throughout the codebase
import chalk from 'chalk';

// Success messages (green)
console.log(chalk.green('✅ Import successful'));

// Error messages (red)
console.log(chalk.red('❌ Error:', error.message));

// Warnings (yellow)
console.log(chalk.yellow('⚠️ Warning: Browser may be running'));

// Informational (blue)
console.log(chalk.blue('🔄 Starting import...'));

// Secondary info (gray)
console.log(chalk.gray('📂 Reading from: ./data/master.json'));

// Combining styles
console.log(chalk.white(result.title) + chalk.gray(` [${result.domain}]`));
```

**Color conventions in this project**:

| Color | Usage |
|-------|-------|
| Blue | Headers, starting actions |
| Green | Success, completed actions |
| Yellow | Warnings, tips |
| Red | Errors |
| Gray | Secondary info, paths, details |
| White | Primary data, user content |

**Why we chose it**:
- Simple, chainable API
- Auto-detects terminal color support
- Pure ESM (v5+)
- Zero dependencies
- Well-maintained

---

## Development Dependencies

### TypeScript

| Property | Value |
|----------|-------|
| **Package** | `typescript` |
| **Version** | ^5.3.3 |
| **Purpose** | TypeScript compiler |
| **Website** | https://www.typescriptlang.org/ |

**What it does**:
TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static type checking to catch errors before runtime.

**How we use it**:

Compilation is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**Key settings**:
- `target: ES2022` — Modern JavaScript output
- `module: NodeNext` — ESM output for Node.js
- `strict: true` — Enable all strict type checks
- `outDir: ./dist` — Compiled files go here
- `rootDir: ./src` — Source files location

**Why we chose it**:
- Catches type errors at compile time
- Better IDE support (autocomplete, refactoring)
- Self-documenting code through types
- Industry standard for Node.js projects

---

### @types/node

| Property | Value |
|----------|-------|
| **Package** | `@types/node` |
| **Version** | ^20.11.0 |
| **Purpose** | TypeScript definitions for Node.js |
| **Website** | https://github.com/DefinitelyTyped/DefinitelyTyped |

**What it does**:
Provides TypeScript type definitions for Node.js built-in modules like `fs`, `path`, `process`, etc.

**How we use it**:

```typescript
// These imports have proper types thanks to @types/node
import { mkdir, readFile, writeFile, access } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import { constants } from 'fs';

// process.env is typed
const localAppData = process.env.LOCALAPPDATA;
```

**Why we chose it**:
- Required for TypeScript projects using Node.js APIs
- Matches our Node.js version (20.x)
- Maintained by DefinitelyTyped community

---

## Dependency Management

### Checking for Updates

```bash
# Check for outdated packages
npm outdated

# Update to latest minor versions
npm update

# Update to latest major versions (may have breaking changes)
npx npm-check-updates -u
npm install
```

### Checking for Vulnerabilities

```bash
npm audit
```

### Version Constraints

We use caret (`^`) versioning:
- `^1.4.1` means `>=1.4.1 <2.0.0`
- Allows minor and patch updates
- Protects against breaking major changes

### Adding New Dependencies

Before adding a new dependency:

1. **Check if built-in**: Node.js has many built-in modules
2. **Evaluate size**: Use https://bundlephobia.com/
3. **Check maintenance**: Last updated, open issues
4. **Review license**: Must be compatible with MIT

```bash
# Add production dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name
```

---

## Dependency Tree

```
onetab-importer
├── chalk@5.3.0 (no dependencies)
├── classic-level@1.4.1
│   ├── abstract-level@2.0.0
│   ├── catering@2.1.1
│   ├── module-error@1.0.2
│   ├── napi-macros@2.2.2
│   ├── node-gyp-build@4.8.0
│   └── ...
└── commander@12.1.0 (no dependencies)
```

Most dependencies have minimal transitive dependencies, keeping the overall footprint small.

---

## Related Documentation

- [Tech Stack](../overview/TECH_STACK.md) — Overall technology choices
- [Installation](../getting-started/INSTALLATION.md) — Installing dependencies
- [Troubleshooting](../guides/TROUBLESHOOTING.md) — Dependency-related issues
