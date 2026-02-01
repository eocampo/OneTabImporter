# Common Tasks

## Table of Contents

- [Extracting OneTab Data](#extracting-onetab-data)
- [Managing Your Data](#managing-your-data)
- [Searching and Filtering](#searching-and-filtering)
- [Exporting and Sharing](#exporting-and-sharing)
- [Backup and Recovery](#backup-and-recovery)
- [Development Tasks](#development-tasks)

---

## Extracting OneTab Data

### Task: Export from Edge with DevTools

**Goal**: Extract your OneTab data from Microsoft Edge using the DevTools console.

**Steps**:

1. **Open OneTab in Edge**
   - Click the OneTab extension icon in your browser toolbar
   - The OneTab page opens showing all your saved tabs

2. **Open DevTools**
   - Press `F12` or right-click and select "Inspect"
   - Click on the **Console** tab

3. **Get the extraction script**
   ```bash
   npm run start -- script
   ```

4. **Run the script in the console**
   - Copy the entire script from the terminal
   - Paste it into the DevTools console
   - Press Enter
   - A JSON file will automatically download

5. **Import the downloaded file**
   ```bash
   npm run start -- import --input ~/Downloads/onetab-export-2026-02-01.json
   ```

> 💡 **Tip**: The downloaded file is named `onetab-export-YYYY-MM-DD.json` based on the current date.

---

### Task: Export from Chrome with DevTools

**Goal**: Same process as Edge, but for Google Chrome.

**Steps**: Follow the same steps as Edge above. The script works identically in Chrome.

---

### Task: Copy LevelDB Directly (Windows)

**Goal**: Extract data by copying the browser's LevelDB storage files.

**Steps**:

1. **Close all browser windows completely**
   - Make sure Edge/Chrome is not running
   - Check Task Manager for any background processes

2. **Run the copy script**
   ```bash
   npm run copy-db
   ```

   Or specify browser:
   ```bash
   powershell -ExecutionPolicy Bypass -File scripts/copy-leveldb.ps1 -Browser chrome
   ```

3. **Import from the copy**
   ```bash
   npm run start -- import --leveldb ./leveldb-copy
   ```

> ⚠️ **Warning**: The browser must be completely closed. LevelDB files are locked while the browser is running.

---

### Task: Import from a Different Browser Profile

**Goal**: Import from a non-default browser profile.

**Steps**:

1. **Find your profile name**
   - Edge/Chrome: Look in `%LOCALAPPDATA%\Microsoft\Edge\User Data\` (or `Google\Chrome`)
   - Profiles are named `Default`, `Profile 1`, `Profile 2`, etc.

2. **Run copy script with profile parameter**
   ```bash
   powershell -ExecutionPolicy Bypass -File scripts/copy-leveldb.ps1 -Profile "Profile 1"
   ```

3. **Import normally**
   ```bash
   npm run start -- import --leveldb ./leveldb-copy
   ```

---

## Managing Your Data

### Task: View Your Import Statistics

**Goal**: See how many tabs and groups you have imported.

**Command**:
```bash
npm run start -- info
```

Or check the master JSON directly:
```bash
# Using jq (if installed)
cat data/master.json | jq '.stats'

# Or open in your editor
code data/master.json
```

**Output**:
```json
{
  "totalGroups": 150,
  "totalTabs": 2500,
  "dateRange": {
    "earliest": "2023-01-15T08:30:00.000Z",
    "latest": "2026-02-01T10:03:00.000Z"
  }
}
```

---

### Task: Merge Multiple Imports

**Goal**: Combine data from multiple exports (e.g., different browsers or time periods).

**Steps**:

1. **Import first file**
   ```bash
   npm run start -- import --input export-january.json
   ```

2. **Import second file (will merge automatically)**
   ```bash
   npm run start -- import --input export-february.json
   ```

The importer automatically:
- Detects existing master data
- Identifies new groups by their unique ID
- Adds only new groups (no duplicates)

> 💡 **Tip**: Check the output message to see how many new groups were added.

---

### Task: Reset and Start Fresh

**Goal**: Delete all imported data and start over.

**Steps**:

```bash
# Delete master data
rm ./data/master.json

# Delete exported markdown (if any)
rm -rf ./output/*

# Re-import
npm run start -- import --input your-export.json
```

---

## Searching and Filtering

### Task: Find Tabs by Keyword

**Goal**: Search for tabs containing a specific word in title or URL.

**Command**:
```bash
npm run start -- search --query "react hooks"
```

**Options**:
```bash
# Case-insensitive by default
npm run start -- search -q "REACT"

# Search with date filter
npm run start -- search -q "react" --from 2025-01 --to 2025-12
```

---

### Task: Find Tabs from a Specific Website

**Goal**: Find all tabs from a particular domain.

**Command**:
```bash
npm run start -- search --domain "stackoverflow.com"
```

**Variations**:
```bash
# Partial domain match
npm run start -- search --domain "github"

# Multiple searches
npm run start -- search --domain "youtube.com"
npm run start -- search --domain "vimeo.com"
```

---

### Task: Use Regular Expressions

**Goal**: Search with complex patterns.

**URL Pattern**:
```bash
# Find all YouTube videos (not channels/playlists)
npm run start -- search --url-pattern "youtube\\.com/watch"

# Find GitHub repositories (owner/repo pattern)
npm run start -- search --url-pattern "github\\.com/[^/]+/[^/]+$"
```

**Title Pattern**:
```bash
# Find tutorials or guides
npm run start -- search --title-pattern "tutorial|guide|how to"

# Find numbered articles
npm run start -- search --title-pattern "\\d+ (tips|ways|reasons)"
```

---

### Task: See Your Most Visited Domains

**Goal**: Analyze which websites you save the most.

**Command**:
```bash
npm run start -- domains
```

**Output**:
```
📊 Top Domains

 142 ████████████████████ github.com
  98 ██████████████ stackoverflow.com
  67 █████████ youtube.com
  45 ██████ medium.com
  32 ████ twitter.com

Total unique domains: 387
```

---

## Exporting and Sharing

### Task: Export All Data as Markdown

**Goal**: Create human-readable Markdown files from your tabs.

**Command**:
```bash
npm run start -- export
```

**Output structure**:
```
output/
└── 2026/
    ├── 2026-01.md
    └── 2026-02.md
```

---

### Task: Export by Week or Day

**Goal**: Get more granular Markdown files.

**By week**:
```bash
npm run start -- export --group-by week
```

**By day**:
```bash
npm run start -- export --group-by day
```

---

### Task: Export a Specific Time Period

**Goal**: Export only certain months.

**Command**:
```bash
# Export January 2026 only
npm run start -- export --from 2026-01 --to 2026-01

# Export first half of 2025
npm run start -- export --from 2025-01 --to 2025-06

# Export everything from July 2025 to now
npm run start -- export --from 2025-07
```

---

### Task: Create a Single Export File

**Goal**: Export all tabs to one Markdown file.

**Command**:
```bash
npm run start -- export --single
```

**Output**: `output/all-links.md`

---

### Task: Export Search Results

**Goal**: Save search results to a file.

**As Markdown**:
```bash
npm run start -- search --query "docker" --format markdown
# Creates: search-results-TIMESTAMP.md
```

**As JSON**:
```bash
npm run start -- search --query "docker" --format json
# Creates: search-results-TIMESTAMP.json
```

---

## Backup and Recovery

### Task: Create a Full Backup

**Goal**: Backup all your imported tab data.

**Steps**:

```bash
# Create backup directory
mkdir -p ./backups/$(date +%Y-%m-%d)

# Copy master data
cp ./data/master.json ./backups/$(date +%Y-%m-%d)/

# Export to Markdown as additional backup
npm run start -- export --output ./backups/$(date +%Y-%m-%d)/markdown
```

---

### Task: Scheduled Backup Script

**Goal**: Automate regular backups.

**Create `backup.sh`**:
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="./backups/$DATE"

mkdir -p "$BACKUP_DIR"
cp ./data/master.json "$BACKUP_DIR/"
echo "Backup created: $BACKUP_DIR/master.json"
```

**Schedule with cron (Linux/macOS)**:
```bash
# Run weekly on Sundays at 2am
0 2 * * 0 /path/to/backup.sh
```

---

### Task: Restore from Backup

**Goal**: Restore data from a previous backup.

**Steps**:

```bash
# View available backups
ls -la ./backups/

# Restore specific backup
cp ./backups/2026-01-15/master.json ./data/master.json

# Verify
npm run start -- info
```

---

## Development Tasks

### Task: Add a New CLI Command

**Goal**: Add a custom command to the CLI.

See [First Contribution](../getting-started/FIRST_CONTRIBUTION.md) for a detailed walkthrough.

**Quick summary**:
1. Create `src/commands/mycommand.ts`
2. Add interface to `src/models/types.ts`
3. Register in `src/cli.ts`
4. Rebuild: `npm run build`

---

### Task: Modify the Export Format

**Goal**: Customize how Markdown is generated.

**File to modify**: `src/commands/export.ts`

**Key function**: `generateGroupMarkdown()`

```typescript
function generateGroupMarkdown(group: TabGroup): string {
  // Customize this function to change output format
}
```

---

### Task: Debug a Parsing Issue

**Goal**: Understand why import is failing.

**Steps**:

1. **Dump raw LevelDB data**
   ```bash
   npm run start -- debug dump ./leveldb-copy -o raw-dump.json
   ```

2. **Inspect the structure**
   ```bash
   cat raw-dump.json | jq 'keys'
   cat raw-dump.json | jq '.state | keys'
   ```

3. **Check for encoding issues**
   ```bash
   # Is tabGroups a string (double-encoded)?
   cat raw-dump.json | jq '.state.tabGroups | type'
   ```

See [Debugging](../development/DEBUGGING.md) for more techniques.

---

## Related Documentation

- [Running the App](../getting-started/RUNNING_THE_APP.md) — Complete CLI reference
- [Configuration](../getting-started/CONFIGURATION.md) — All available options
- [Troubleshooting](./TROUBLESHOOTING.md) — Solving common problems
