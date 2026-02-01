# Agent Context: OneTab Importer

This document provides context for AI agents (GitHub Copilot CLI, Cursor, etc.) to assist with development and usage of the OneTab Importer project.

## Project Overview

**Purpose**: Import OneTab browser extension data with timestamps, convert to JSON master format and date-organized Markdown files.

**Stack**: Node.js 20+, TypeScript 5.x, ESM modules

**Key Libraries**:

- `commander` - CLI framework
- `classic-level` - LevelDB parsing
- `chalk` - Terminal colors

## Project Structure

```
src/
├── cli.ts              # Main CLI entry, command definitions
├── commands/
│   ├── import.ts       # Import from JSON/LevelDB → master.json
│   ├── export.ts       # Export master.json → Markdown files
│   └── search.ts       # Search through master.json
├── parsers/
│   ├── json.ts         # Parse OneTab JSON, validate, normalize
│   └── leveldb.ts      # Parse LevelDB directly
├── models/
│   └── types.ts        # All TypeScript interfaces
└── utils/
    ├── dates.ts        # Date parsing, formatting, ranges
    └── files.ts        # File I/O, path helpers
```

## Data Flow

```
Browser LevelDB Storage
        ↓
[copy-leveldb.ps1] → ./leveldb-copy/
        ↓
[import command] → parsers/leveldb.ts → parsers/json.ts
        ↓
./data/master.json (normalized JSON)
        ↓
[export command] → ./output/YYYY/YYYY-MM.md
```

## Key Types (src/models/types.ts)

### OneTab Native Format

```typescript
interface OneTabGroup {
  id: string;
  tabsMeta: { id: string; url: string; title: string }[];
  createDate: number;  // Unix epoch milliseconds
  starred?: boolean;
  title?: string;
}
```

### Normalized Master Format

```typescript
interface TabGroup {
  id: string;
  tabs: Tab[];
  createdAt: string;        // ISO 8601
  createdAtEpoch: number;   // Original epoch ms
  tabCount: number;
  starred: boolean;
  title?: string;
}

interface MasterData {
  schemaVersion: string;
  exportedAt: string;
  source: { browser, extensionId, extractionMethod };
  stats: { totalGroups, totalTabs, dateRange };
  groups: TabGroup[];
}
```

## CLI Commands

### Import

```bash
onetab import --input <json-file>        # From DevTools export
onetab import --leveldb <path>           # From LevelDB copy
onetab import -b chrome -e <custom-id>   # Custom browser/extension
```

### Export

```bash
onetab export                            # To ./output/ by month
onetab export --group-by week            # By week
onetab export --from 2025-01 --to 2025-06 # Date filter
onetab export --single                   # Single file
```

### Search

```bash
onetab search -q "query"                 # Text search
onetab search -d "domain.com"            # Domain filter
onetab search --url-pattern "regex"      # URL regex
onetab search --from 2025-06             # Date filter
onetab search -f markdown                # Output as Markdown
```

## Common Tasks

### Add a new CLI command

1. Create command file in `src/commands/`
2. Export the main function
3. Register in `src/cli.ts` using `program.command()`

### Modify the data schema

1. Update interfaces in `src/models/types.ts`
2. Update SCHEMA_VERSION constant
3. Update parsers in `src/parsers/json.ts`
4. Add migration logic if needed

### Add a new export format

1. Add format function in `src/commands/export.ts`
2. Add CLI option in `src/cli.ts`

## Browser Extension Details

| Browser | Extension ID | LevelDB Path |
|---------|-------------|--------------|
| Edge | `hoimpamkkoehapgenciaoajfkfkpgfop` | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Extension Settings\<id>` |
| Chrome | `chphlpgkkbolifaimnlloiipkdnihall` | `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Extension Settings\<id>` |

## DevTools Extraction Script

Run `onetab script` to print. The script:

1. Reads `localStorage.state` on the OneTab page
2. Downloads as JSON with timestamps
3. Works with current and older OneTab versions

## Troubleshooting

### LevelDB parse errors

- Ensure browser is fully closed
- Try `onetab debug list-keys ./leveldb-copy` to see what's available
- Use `onetab debug dump ./leveldb-copy -o dump.json` for full inspection

### Missing timestamps

- DevTools export preserves timestamps
- LevelDB copy preserves timestamps
- Built-in OneTab Export/Import does NOT include timestamps

### Multi-profile browsers

- Use `--profile "Profile 1"` with copy-leveldb.ps1
- Check `%LOCALAPPDATA%\Microsoft\Edge\User Data\` for profile folders

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm run dev          # Watch mode
npm run start -- <command>  # Run CLI
```
