# OneTab Importer

Import and manage OneTab browser extension links with timestamps. Export to JSON (master data) and Markdown (human-readable) formats, organized by date.

## Features

- **Import with timestamps**: Extract OneTab data preserving group creation dates
- **Multiple import sources**: DevTools JSON export or direct LevelDB parsing
- **JSON master format**: Normalized, searchable data with full metadata
- **Markdown export**: Human-readable files organized by month/week/day
- **Search**: Find tabs by title, URL, domain, or date range
- **Safe LevelDB copy**: PowerShell script to safely copy browser data

## Quick Start

### Prerequisites

- Node.js 20+ LTS
- npm or pnpm
- Microsoft Edge or Google Chrome with OneTab installed

### Installation

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build
```

### Usage

#### Method 1: DevTools Export (Recommended)

1. Open OneTab in your browser
2. Press F12 to open DevTools
3. Go to Console tab
4. Run the extraction script:

```bash
npm run start -- script
```

1. Copy and run the displayed script in the browser console
2. Import the downloaded JSON:

```bash
npm run start -- import --input onetab-export-2026-02-01.json
```

#### Method 2: Direct LevelDB Copy

1. Close all browser windows
2. Run the copy script:

```bash
npm run copy-db
# Or with parameters:
powershell -ExecutionPolicy Bypass -File scripts/copy-leveldb.ps1 -Browser edge
```

1. Import from the copy:

```bash
npm run start -- import --leveldb ./leveldb-copy
```

### Export to Markdown

```bash
# Export by month (default)
npm run start -- export

# Export by week
npm run start -- export --group-by week

# Export specific date range
npm run start -- export --from 2025-01 --to 2025-12

# Export as single file
npm run start -- export --single
```

### Search

```bash
# Search by keyword
npm run start -- search --query "github"

# Search by domain
npm run start -- search --domain "stackoverflow.com"

# Search with date range
npm run start -- search --query "react" --from 2025-06

# Export search results as Markdown
npm run start -- search --query "tutorial" --format markdown
```

### Other Commands

```bash
# Show top domains
npm run start -- domains

# Show configuration info
npm run start -- info

# Debug: list LevelDB keys
npm run start -- debug list-keys ./leveldb-copy

# Debug: dump LevelDB to JSON
npm run start -- debug dump ./leveldb-copy -o dump.json
```

## File Structure

```
onetabimporter/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── commands/
│   │   ├── import.ts       # Import from JSON or LevelDB
│   │   ├── export.ts       # Export to Markdown
│   │   └── search.ts       # Search functionality
│   ├── parsers/
│   │   ├── json.ts         # JSON parser/validator
│   │   └── leveldb.ts      # LevelDB parser
│   ├── models/
│   │   └── types.ts        # TypeScript interfaces
│   └── utils/
│       ├── dates.ts        # Date formatting helpers
│       └── files.ts        # File I/O helpers
├── scripts/
│   └── copy-leveldb.ps1    # Safe LevelDB copy script
├── data/                   # Master JSON storage
│   └── master.json         # Normalized OneTab data
├── output/                 # Generated Markdown
│   └── 2026/
│       ├── 2026-01.md
│       └── 2026-02.md
├── docs/
│   ├── AGENT_CONTEXT.md    # For AI agent sessions
│   └── DATA_SCHEMA.md      # Data format documentation
├── package.json
├── tsconfig.json
└── README.md
```

## Browser Extension IDs

| Browser | Extension ID |
|---------|-------------|
| Edge | `hoimpamkkoehapgenciaoajfkfkpgfop` |
| Chrome | `chphlpgkkbolifaimnlloiipkdnihall` |

## LevelDB Locations (Windows)

| Browser | Path |
|---------|------|
| Edge | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Extension Settings\<id>` |
| Chrome | `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Extension Settings\<id>` |

## License

MIT
