# Tech Stack

## Table of Contents

- [Overview](#overview)
- [Runtime Environment](#runtime-environment)
- [Core Technologies](#core-technologies)
- [Dependencies](#dependencies)
- [Development Dependencies](#development-dependencies)
- [Build System](#build-system)
- [Technology Rationale](#technology-rationale)

---

## Overview

OneTab Importer is built with modern JavaScript/TypeScript technologies, designed for simplicity and minimal dependencies.

```
┌─────────────────────────────────────────────────────────────┐
│                     Runtime Environment                      │
│                        Node.js 20+                          │
├─────────────────────────────────────────────────────────────┤
│                     Language & Types                         │
│                  TypeScript 5.x (ESM)                       │
├─────────────────────────────────────────────────────────────┤
│                      Dependencies                            │
│  commander (CLI)  │  classic-level (LevelDB)  │  chalk (UI) │
└─────────────────────────────────────────────────────────────┘
```

---

## Runtime Environment

### Node.js

| Aspect | Value |
|--------|-------|
| **Required Version** | 20.0.0 or higher (LTS recommended) |
| **Module System** | ES Modules (ESM) |
| **Package Manager** | npm (pnpm also supported) |

**Why Node.js 20+?**
- Native ESM support without experimental flags
- Built-in `fs/promises` API for async file operations
- Performance improvements for file I/O
- LTS support until April 2026

---

## Core Technologies

### TypeScript

| Aspect | Value |
|--------|-------|
| **Version** | 5.3+ |
| **Target** | ES2022 |
| **Module** | NodeNext |
| **Strict Mode** | Enabled |

**Configuration highlights** (from `tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

**Why TypeScript?**
- Static type checking catches errors before runtime
- Better IDE support with autocompletion and documentation
- Self-documenting code through interfaces
- Easier refactoring with type safety

### ES Modules (ESM)

The project uses native ES Modules instead of CommonJS:

```typescript
// ESM imports (used in this project)
import { Command } from 'commander';
import chalk from 'chalk';

// File extensions required for local imports
import { parseOneTabJson } from './parsers/json.js';
```

**Why ESM?**
- Modern JavaScript standard
- Better tree-shaking for potential bundling
- Cleaner syntax for dynamic imports
- Node.js is moving toward ESM-first

---

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `commander` | ^12.1.0 | CLI framework for command parsing |
| `classic-level` | ^1.4.1 | LevelDB database reading |
| `chalk` | ^5.3.0 | Terminal string styling (colors) |

#### Commander.js

**Purpose**: Parses command-line arguments and generates help text.

```typescript
// src/cli.ts
import { Command } from 'commander';

const program = new Command();
program
  .command('import')
  .option('-i, --input <path>', 'JSON file')
  .action(async (options) => { /* ... */ });
```

**Why Commander?**
- Most popular Node.js CLI framework
- Automatic help generation
- Subcommand support
- Type-safe options parsing

> 📚 See [Dependencies Reference](../reference/DEPENDENCIES.md) for detailed usage

#### Classic-Level

**Purpose**: Reads LevelDB databases (the format used by Chrome/Edge extensions).

```typescript
// src/parsers/leveldb.ts
import { ClassicLevel } from 'classic-level';

const db = new ClassicLevel<string, string>(levelDbPath, {
  createIfMissing: false,
  valueEncoding: 'utf8',
});
```

**Why classic-level?**
- Maintained fork of the original `level` package
- Pure JavaScript with native bindings for performance
- Async/await support
- Works with Chromium's LevelDB format

> ⚠️ **Note**: Requires the browser to be closed before reading LevelDB files.

#### Chalk

**Purpose**: Colorizes terminal output for better readability.

```typescript
// src/commands/import.ts
import chalk from 'chalk';

console.log(chalk.green('✅ Parsed 150 groups'));
console.log(chalk.red('❌ Import failed:'), error);
console.log(chalk.gray('📂 Reading from: ./data'));
```

**Why Chalk?**
- Simple, chainable API
- Auto-detects terminal color support
- ESM native (v5+)
- No runtime dependencies

---

## Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/node` | ^20.11.0 | TypeScript definitions for Node.js |
| `typescript` | ^5.3.3 | TypeScript compiler |

### No Additional Tooling

The project intentionally keeps development dependencies minimal:

- **No bundler**: TypeScript compiles directly to runnable JavaScript
- **No linter config**: Relies on TypeScript strict mode for code quality
- **No test framework**: Not currently implemented (opportunity for contribution)
- **No formatter**: Relies on IDE formatting

---

## Build System

### TypeScript Compilation

```bash
# One-time build
npm run build

# Watch mode for development
npm run dev
```

The build process:
1. TypeScript compiler (`tsc`) reads `tsconfig.json`
2. Compiles all `.ts` files in `src/`
3. Outputs JavaScript to `dist/`
4. Generates source maps and declaration files

### Output Structure

```
dist/
├── cli.js                  # Compiled entry point
├── cli.js.map              # Source map
├── cli.d.ts                # Type declarations
├── commands/
│   ├── import.js
│   ├── export.js
│   └── search.js
├── parsers/
│   ├── json.js
│   └── leveldb.js
├── models/
│   └── types.js
└── utils/
    ├── dates.js
    └── files.js
```

---

## Technology Rationale

### Why These Specific Choices?

| Decision | Alternative Considered | Reason for Choice |
|----------|------------------------|-------------------|
| Node.js | Deno, Bun | Most mature ecosystem, LevelDB library availability |
| TypeScript | JavaScript | Type safety, better maintainability |
| Commander | yargs, oclif | Simpler API, no decorators needed |
| classic-level | leveldown, rocksdb | Best compatibility with Chrome's LevelDB |
| chalk | colors, picocolors | ESM native, good API, well-maintained |
| No bundler | esbuild, rollup | Direct Node.js execution, simpler build |
| No test framework | Jest, Vitest | Simplicity (but good opportunity to add) |

### Trade-offs

| Trade-off | Benefit | Cost |
|-----------|---------|------|
| Minimal dependencies | Fast install, small attack surface | Less functionality out of the box |
| TypeScript strict mode | Fewer runtime errors | More verbose code |
| ESM-only | Modern standards | Requires `.js` extensions in imports |
| No bundler | Simple build process | Larger output, no tree-shaking |

---

## Version Compatibility Matrix

| Node.js | TypeScript | Status |
|---------|------------|--------|
| 18.x | 5.x | ⚠️ May work but unsupported |
| 20.x | 5.x | ✅ Recommended |
| 22.x | 5.x | ✅ Supported |

---

## Related Documentation

- [Prerequisites](../getting-started/PREREQUISITES.md) — Required software
- [Installation](../getting-started/INSTALLATION.md) — Setup instructions
- [Dependencies Reference](../reference/DEPENDENCIES.md) — Detailed dependency documentation
