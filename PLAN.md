# OneTab Importer - Project Plan

## Overview

Import OneTab browser extension data **with timestamps**, convert to JSON master format and date-organized Markdown files, with a CLI tool for management and search.

## Decisions Made

| Decision | Choice |
|----------|--------|
| Storage format | **Both**: JSON master + Markdown views |
| Default browser | **Edge** with custom ID support via `--extension-id` flag |
| LevelDB handling | **Copy first**, process from `./leveldb-copy/` directory |
| Runtime | Node.js 20+ LTS |
| Language | TypeScript 5.x (strict mode, ESM) |

## Data Flow

```
Browser LevelDB Storage
        ↓
[copy-leveldb.ps1] → ./leveldb-copy/
        ↓
[import command] → ./data/master.json
        ↓
[export command] → ./output/YYYY/YYYY-MM.md
```

## Implementation Status

- [x] Project configuration (package.json, tsconfig.json)
- [x] TypeScript models (types.ts)
- [x] Utility modules (dates.ts, files.ts)
- [x] Parsers (json.ts, leveldb.ts)
- [x] CLI commands (import.ts, export.ts, search.ts)
- [x] CLI entry point (cli.ts)
- [x] PowerShell copy script (copy-leveldb.ps1)
- [x] Documentation (README.md, AGENT_CONTEXT.md, DATA_SCHEMA.md)

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Show help
npm run start -- --help

# Copy LevelDB (close browser first!)
npm run copy-db

# Import from LevelDB copy
npm run start -- import --leveldb ./leveldb-copy

# Or use DevTools export method:
npm run start -- script
# (run the script in browser console, then)
npm run start -- import --input onetab-export-YYYY-MM-DD.json

# Export to Markdown
npm run start -- export

# Search
npm run start -- search --query "github"
```

## Key Files

| File | Purpose |
|------|---------|
| [src/cli.ts](src/cli.ts) | CLI entry point |
| [src/models/types.ts](src/models/types.ts) | All TypeScript interfaces |
| [src/parsers/json.ts](src/parsers/json.ts) | Parse/validate OneTab JSON |
| [src/parsers/leveldb.ts](src/parsers/leveldb.ts) | Parse LevelDB directly |
| [src/commands/import.ts](src/commands/import.ts) | Import command |
| [src/commands/export.ts](src/commands/export.ts) | Export to Markdown |
| [src/commands/search.ts](src/commands/search.ts) | Search functionality |
| [scripts/copy-leveldb.ps1](scripts/copy-leveldb.ps1) | Safe LevelDB copy |
| [docs/AGENT_CONTEXT.md](docs/AGENT_CONTEXT.md) | AI agent context |
| [docs/DATA_SCHEMA.md](docs/DATA_SCHEMA.md) | Data format docs |

## Browser Extension IDs

| Browser | Extension ID |
|---------|-------------|
| Edge | `hoimpamkkoehapgenciaoajfkfkpgfop` |
| Chrome | `chphlpgkkbolifaimnlloiipkdnihall` |

## CLI Commands

```
onetab import       Import OneTab data from JSON or LevelDB
onetab export       Export master data to Markdown files
onetab search       Search through OneTab data
onetab domains      List all unique domains with counts
onetab script       Print the DevTools extraction script
onetab info         Show configuration and paths
onetab debug        Debug utilities (list-keys, dump)
```

## Next Steps (Future Enhancements)

1. **Web UI**: Create a simple web interface for browsing links
2. **Deduplication**: Detect and merge duplicate URLs across groups
3. **Tags**: Add tagging support for better organization
4. **Sync**: Export/import for cloud backup
5. **Stats dashboard**: Visualize browsing patterns over time
