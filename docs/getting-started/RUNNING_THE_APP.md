# Running the App

## Table of Contents

- [Quick Reference](#quick-reference)
- [Importing OneTab Data](#importing-onetab-data)
- [Exporting to Markdown](#exporting-to-markdown)
- [Searching Your Tabs](#searching-your-tabs)
- [Utility Commands](#utility-commands)
- [Debug Commands](#debug-commands)

---

## Quick Reference

```bash
# Show all commands
npm run start -- --help

# Import from JSON export
npm run start -- import --input onetab-export.json

# Export to Markdown
npm run start -- export

# Search your tabs
npm run start -- search --query "github"

# Show top domains
npm run start -- domains

# Show configuration
npm run start -- info
```

---

## Importing OneTab Data

There are two methods to import your OneTab data, each preserving the original timestamps.

### Method 1: DevTools Export (Recommended)

This method works on any operating system and doesn't require closing the browser.

#### Step 1: Get the Extraction Script

```bash
npm run start -- script
```

This prints a JavaScript snippet to the console.

#### Step 2: Run the Script in Browser

1. Open your browser (Edge or Chrome)
2. Navigate to the OneTab page (click the OneTab extension icon)
3. Press **F12** to open DevTools
4. Go to the **Console** tab
5. Copy and paste the script from Step 1
6. Press **Enter** to run it
7. A JSON file will download automatically

#### Step 3: Import the JSON File

```bash
npm run start -- import --input ~/Downloads/onetab-export-2026-02-01.json
```

**Expected output**:
```
🔄 OneTab Import

📂 Reading JSON from: /home/user/Downloads/onetab-export-2026-02-01.json
✅ Parsed 150 groups with 2500 tabs
💾 Saved to: ./data/master.json

📊 Summary:
   Total groups: 150
   Total tabs:   2500
   Date range:   2023-01-15 to 2026-02-01
```

### Method 2: Direct LevelDB Copy (Windows Only)

This method reads directly from the browser's extension storage.

#### Step 1: Close the Browser

> ⚠️ **Important**: The browser must be completely closed. LevelDB locks files while in use.

#### Step 2: Run the Copy Script

```bash
npm run copy-db
```

Or with specific options:
```bash
powershell -ExecutionPolicy Bypass -File scripts/copy-leveldb.ps1 -Browser chrome
```

#### Step 3: Import from the Copy

```bash
npm run start -- import --leveldb ./leveldb-copy
```

### Import Options

```bash
# Import from Chrome instead of Edge
npm run start -- import --leveldb ./leveldb-copy --browser chrome

# Use a custom extension ID
npm run start -- import --leveldb ./path/to/leveldb --extension-id "custom-id"

# Save to a different output file
npm run start -- import -i export.json -o ./backups/tabs.json
```

### Merging Imports

If you import multiple times, the importer automatically **merges** new data with existing data:

```bash
# First import
npm run start -- import -i onetab-january.json

# Second import (merges new groups)
npm run start -- import -i onetab-february.json
```

Only new tab groups (identified by their unique ID) are added. Existing groups are not duplicated.

---

## Exporting to Markdown

Convert your master JSON to human-readable Markdown files.

### Basic Export

```bash
npm run start -- export
```

This creates Markdown files organized by **month** in the `./output` directory:

```
output/
└── 2026/
    ├── 2026-01.md
    └── 2026-02.md
```

### Export Options

#### Group by Week

```bash
npm run start -- export --group-by week
```

Creates files like:
```
output/
└── 2026/
    ├── 2026-W01.md
    ├── 2026-W02.md
    └── ...
```

#### Group by Day

```bash
npm run start -- export --group-by day
```

Creates files like:
```
output/
└── 2026/
    └── 2026-02/
        ├── 2026-02-01.md
        ├── 2026-02-02.md
        └── ...
```

#### Filter by Date Range

```bash
# Export only January 2026
npm run start -- export --from 2026-01 --to 2026-01

# Export from June 2025 to now
npm run start -- export --from 2025-06
```

#### Export as Single File

```bash
npm run start -- export --single
```

Creates one file: `./output/all-links.md`

#### Custom Output Directory

```bash
npm run start -- export --output ~/Documents/onetab-archive
```

### Markdown Format

Each exported file looks like:

```markdown
---
period: "2026-02"
groupBy: "month"
totalGroups: 15
totalTabs: 280
generated: "2026-02-01T12:00:00.000Z"
---

# OneTab Links: 2026-02

> **15** tab groups, **280** total links

### Feb 1, 2026, 10:03 AM ⭐

- [Example Page Title](https://example.com/page)
- [Another Page](https://another.example.com)

### Feb 1, 2026, 9:15 AM

- [GitHub](https://github.com)
- [Stack Overflow](https://stackoverflow.com)
```

---

## Searching Your Tabs

Find tabs in your master data with various filters.

### Search by Keyword

```bash
npm run start -- search --query "github"
```

Searches in title, URL, and domain.

**Example output**:
```
🔍 OneTab Search

Search: query: "github"
✅ Found 25 matches

📅 2026-02-01
  • GitHub - octocat/repo [github.com] (title, url, domain)
    https://github.com/octocat/repo
  • GitHub Actions Documentation [github.com] (title, domain)
    https://docs.github.com/actions

📅 2026-01-28
  • ...
```

### Search by Domain

```bash
npm run start -- search --domain "stackoverflow.com"
```

### Search with URL Pattern (Regex)

```bash
# Find all YouTube videos
npm run start -- search --url-pattern "youtube\\.com/watch"

# Find all GitHub repositories
npm run start -- search --url-pattern "github\\.com/[^/]+/[^/]+"
```

### Search with Title Pattern (Regex)

```bash
npm run start -- search --title-pattern "tutorial|guide|how to"
```

### Filter by Date

```bash
# Search in a date range
npm run start -- search --query "react" --from 2025-06 --to 2025-12

# Search from a date to now
npm run start -- search --domain "twitter.com" --from 2026-01
```

### Export Search Results

```bash
# Save as JSON
npm run start -- search --query "docker" --format json

# Save as Markdown
npm run start -- search --query "docker" --format markdown
```

Creates files like `search-results-1706799999999.json` or `.md`.

---

## Utility Commands

### List Top Domains

```bash
npm run start -- domains
```

Shows the most common domains in your saved tabs:

```
📊 Top Domains

 142 ████████████████████ github.com
  98 ██████████████ stackoverflow.com
  67 █████████ youtube.com
  45 ██████ medium.com
  ...

Total unique domains: 387
```

### Show Configuration

```bash
npm run start -- info
```

Displays:
- Default extension IDs for each browser
- Default file paths
- Browser LevelDB locations

---

## Debug Commands

Commands for troubleshooting and inspecting raw data.

### List LevelDB Keys

See what keys exist in a LevelDB database:

```bash
npm run start -- debug list-keys ./leveldb-copy
```

**Output**:
```
Keys in LevelDB:
  state
  lastSeenVersion

Total: 2 keys
```

### Dump LevelDB to JSON

Export all LevelDB contents to a JSON file:

```bash
npm run start -- debug dump ./leveldb-copy -o dump.json
```

Or print to console:
```bash
npm run start -- debug dump ./leveldb-copy
```

---

## Common Workflows

### Full Import → Export Workflow

```bash
# 1. Get the extraction script
npm run start -- script

# 2. (Run script in browser DevTools, download JSON)

# 3. Import the exported data
npm run start -- import --input ~/Downloads/onetab-export-2026-02-01.json

# 4. Export to Markdown
npm run start -- export

# 5. Open the output
ls output/
```

### Monthly Backup Workflow

```bash
# Export just the current month
npm run start -- export --from 2026-02 --to 2026-02 --output ./backups/2026-02
```

### Search and Export Workflow

```bash
# Find all research articles and export them
npm run start -- search --domain "arxiv.org" --format markdown
npm run start -- search --domain "scholar.google.com" --format markdown
```

---

## Next Steps

Now that you know how to use the CLI:

- [First Contribution](./FIRST_CONTRIBUTION.md) — Make your first code change
- [Common Tasks](../guides/COMMON_TASKS.md) — More detailed workflows
- [Troubleshooting](../guides/TROUBLESHOOTING.md) — Solve common problems
