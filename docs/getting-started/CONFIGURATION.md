# Configuration

## Table of Contents

- [Overview](#overview)
- [Default Paths](#default-paths)
- [Browser Extension IDs](#browser-extension-ids)
- [Command-Line Options](#command-line-options)
- [Environment Variables](#environment-variables)
- [Customizing Paths](#customizing-paths)

---

## Overview

OneTab Importer uses sensible defaults and requires minimal configuration. Most settings can be overridden via command-line options.

> 💡 **Tip**: Run `npm run start -- info` to see current configuration values.

---

## Default Paths

The following paths are used by default:

| Path | Purpose | Default Value |
|------|---------|---------------|
| **Master JSON** | Primary data storage | `./data/master.json` |
| **Output Directory** | Exported Markdown files | `./output` |
| **LevelDB Copy** | Temporary LevelDB copy | `./leveldb-copy` |

### File Structure

```
OneTabImporter/
├── data/
│   └── master.json         # Your imported tab data (JSON)
├── output/
│   └── 2026/
│       ├── 2026-01.md      # Exported Markdown by month
│       └── 2026-02.md
└── leveldb-copy/           # Temporary (gitignored)
    ├── CURRENT
    ├── LOG
    └── *.ldb
```

---

## Browser Extension IDs

Each browser has a unique extension ID for OneTab:

| Browser | Extension ID |
|---------|--------------|
| **Microsoft Edge** | `hoimpamkkoehapgenciaoajfkfkpgfop` |
| **Google Chrome** | `chphlpgkkbolifaimnlloiipkdnihall` |

These IDs are used to locate the extension's LevelDB storage in your browser's profile folder.

### LevelDB Storage Locations (Windows)

| Browser | Path |
|---------|------|
| **Edge** | `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Local Extension Settings\<extension-id>` |
| **Chrome** | `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Extension Settings\<extension-id>` |

> ℹ️ **Note**: `%LOCALAPPDATA%` typically expands to `C:\Users\<YourName>\AppData\Local`

### Custom Extension ID

If you're using a different version of OneTab or a fork, you can specify a custom extension ID:

```bash
npm run start -- import --leveldb ./leveldb-copy --extension-id "your-extension-id"
```

---

## Command-Line Options

All configuration can be done via command-line options. These override any defaults.

### Import Command Options

```bash
npm run start -- import [options]
```

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input <path>` | `-i` | JSON file from DevTools export | (none) |
| `--leveldb <path>` | `-l` | LevelDB directory path | `./leveldb-copy` |
| `--browser <browser>` | `-b` | Browser type: `edge` \| `chrome` | `edge` |
| `--extension-id <id>` | `-e` | Custom extension ID | (auto from browser) |
| `--output <path>` | `-o` | Output master JSON path | `./data/master.json` |

**Examples**:

```bash
# Import from JSON file
npm run start -- import --input ~/Downloads/onetab-export.json

# Import from Chrome's LevelDB
npm run start -- import --leveldb ./my-leveldb-copy --browser chrome

# Custom output path
npm run start -- import -i export.json -o ./backups/tabs.json
```

### Export Command Options

```bash
npm run start -- export [options]
```

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input <path>` | `-i` | Master JSON input path | `./data/master.json` |
| `--output <path>` | `-o` | Output directory for Markdown | `./output` |
| `--group-by <period>` | `-g` | Group by: `month` \| `week` \| `day` | `month` |
| `--from <date>` | | Filter from date (YYYY-MM-DD or YYYY-MM) | (none) |
| `--to <date>` | | Filter to date (YYYY-MM-DD or YYYY-MM) | (none) |
| `--single` | | Export as single consolidated file | (disabled) |

**Examples**:

```bash
# Export by week instead of month
npm run start -- export --group-by week

# Export only January 2026
npm run start -- export --from 2026-01 --to 2026-01

# Export to custom directory
npm run start -- export --output ~/Documents/onetab-export
```

### Search Command Options

```bash
npm run start -- search [options]
```

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--query <text>` | `-q` | Search query (matches title and URL) | (none) |
| `--url-pattern <regex>` | `-u` | URL pattern (regex) | (none) |
| `--title-pattern <regex>` | `-t` | Title pattern (regex) | (none) |
| `--domain <domain>` | `-d` | Domain filter | (none) |
| `--from <date>` | | Filter from date | (none) |
| `--to <date>` | | Filter to date | (none) |
| `--format <format>` | `-f` | Output: `console` \| `json` \| `markdown` | `console` |
| `--input <path>` | `-i` | Master JSON input path | `./data/master.json` |

**Examples**:

```bash
# Search by keyword
npm run start -- search --query "react hooks"

# Search by domain
npm run start -- search --domain "stackoverflow.com"

# Export search results to Markdown
npm run start -- search -q "tutorial" -f markdown
```

---

## Environment Variables

Currently, only one environment variable is used:

| Variable | Purpose | Used By |
|----------|---------|---------|
| `LOCALAPPDATA` | Windows AppData path | LevelDB path detection |

This is automatically set by Windows and used to locate browser extension storage.

### Adding Custom Environment Variables

If you need to extend the configuration:

```bash
# Example: Set a custom data directory (not currently implemented)
export ONETAB_DATA_DIR=/custom/path
npm run start -- import
```

> ℹ️ **Note**: This is an example of how environment variables could be used. Currently, all paths are configured via command-line options.

---

## Customizing Paths

### Using a Different Data Directory

All paths can be customized via options:

```bash
# Store master data in a different location
npm run start -- import -i export.json -o /path/to/custom/master.json

# Export to a different directory
npm run start -- export -i /path/to/custom/master.json -o /path/to/output
```

### Using Absolute Paths

Both relative and absolute paths work:

```bash
# Relative path (from project root)
npm run start -- import -i ./downloads/export.json

# Absolute path
npm run start -- import -i /home/user/downloads/export.json

# Windows absolute path
npm run start -- import -i C:\Users\Me\Downloads\export.json
```

### Creating Backup Locations

To back up your data to a different location:

```bash
# Import and save to backup location
npm run start -- import -i export.json -o ./backups/$(date +%Y-%m-%d)/master.json
```

---

## Configuration File (Not Implemented)

> ℹ️ **Note**: There is currently no configuration file. All settings are passed via command-line options. This is an opportunity for future contribution.

A potential `onetab.config.json` format could look like:

```json
{
  "browser": "edge",
  "paths": {
    "masterJson": "./data/master.json",
    "outputDir": "./output"
  },
  "export": {
    "groupBy": "month",
    "includeStarred": true
  }
}
```

If you'd like to implement this feature, see [First Contribution](./FIRST_CONTRIBUTION.md).

---

## Next Steps

Now that you understand the configuration options:

➡️ Continue to [Running the App](./RUNNING_THE_APP.md) to learn how to use the CLI

Or see:
- [Common Tasks](../guides/COMMON_TASKS.md) — Step-by-step guides for typical workflows
- [FAQ](../guides/FAQ.md) — Frequently asked questions
