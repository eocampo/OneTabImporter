# Glossary

## Table of Contents

- [General Terms](#general-terms)
- [OneTab Terms](#onetab-terms)
- [Technical Terms](#technical-terms)
- [File Formats](#file-formats)
- [CLI Terms](#cli-terms)

---

## General Terms

### Tab

A single browser tab representing one web page. In the context of OneTab Importer, a tab has:
- **URL**: The web address of the page
- **Title**: The page title (shown in the browser tab)
- **Domain**: The hostname extracted from the URL (e.g., `github.com`)

---

### Tab Group

A collection of tabs that were saved together at the same time. When you click "Send all tabs to OneTab," all open tabs are saved as a single group with a shared timestamp.

**Properties**:
- **ID**: Unique identifier
- **Created At**: When the group was saved (timestamp)
- **Tabs**: Array of tabs in the group
- **Starred**: Whether the group is locked/pinned
- **Title**: Optional custom name

---

### Timestamp

A record of when something happened. OneTab stores timestamps as **Unix epoch milliseconds** (milliseconds since January 1, 1970). OneTab Importer converts these to **ISO 8601 format** for readability.

**Example conversion**:
```
Epoch:    1706799999999
ISO 8601: 2024-02-01T11:59:59.999Z
```

---

### Master Data

The normalized JSON file (`data/master.json`) that contains all imported OneTab data. It's the central storage for the application.

---

## OneTab Terms

### OneTab

A popular browser extension that saves all open tabs as a list with a single click. Available for Chrome and Edge (and other Chromium browsers).

**Links**:
- [Chrome Web Store](https://chrome.google.com/webstore/detail/onetab/chphlpgkkbolifaimnlloiipkdnihall)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/onetab/hoimpamkkoehapgenciaoajfkfkpgfop)

---

### Starred Group

A tab group marked as "starred" or "locked" in OneTab. Starred groups are protected from accidental deletion and typically appear at the top of the list.

In exported Markdown, starred groups are marked with a ⭐ emoji.

---

### Extension ID

A unique identifier for a browser extension. Each browser assigns different IDs to the same extension.

| Browser | OneTab Extension ID |
|---------|---------------------|
| Edge | `hoimpamkkoehapgenciaoajfkfkpgfop` |
| Chrome | `chphlpgkkbolifaimnlloiipkdnihall` |

---

### Extension Storage

Where browser extensions store their data. For Chromium-based browsers, this is a LevelDB database located in the browser's profile folder.

---

## Technical Terms

### LevelDB

A fast, lightweight key-value storage library developed by Google. Chromium-based browsers use LevelDB to store extension data, including OneTab's saved tabs.

**Key characteristics**:
- Stores data as key-value pairs
- Data files are locked while the browser is running
- Binary format (not human-readable without parsing)

---

### ESM (ES Modules)

The modern JavaScript module system using `import` and `export` statements. OneTab Importer uses ESM exclusively.

```typescript
// ESM import (used in this project)
import { Command } from 'commander';

// CommonJS (not used)
const { Command } = require('commander');
```

---

### ISO 8601

An international standard for representing dates and times. OneTab Importer uses ISO 8601 format for all timestamps in the master JSON.

**Format**: `YYYY-MM-DDTHH:mm:ss.sssZ`

**Example**: `2026-02-01T10:30:00.000Z`

---

### Unix Epoch

The number of seconds (or milliseconds) that have elapsed since January 1, 1970, 00:00:00 UTC. OneTab stores timestamps as epoch milliseconds.

**Example**: `1706799999999` (milliseconds)

---

### TypeScript

A typed superset of JavaScript that compiles to plain JavaScript. OneTab Importer is written in TypeScript for type safety and better developer experience.

---

### CLI (Command-Line Interface)

A text-based interface for interacting with software. OneTab Importer is a CLI tool, meaning you use it by typing commands in a terminal.

```bash
npm run start -- import --input file.json
```

---

### DevTools

Browser developer tools, accessed by pressing F12 or right-clicking and selecting "Inspect." OneTab Importer uses the DevTools Console to run JavaScript for extracting OneTab data.

---

### YAML Frontmatter

Metadata at the beginning of a Markdown file, enclosed in `---` delimiters. OneTab Importer adds frontmatter to exported Markdown files.

```markdown
---
period: "2026-02"
totalGroups: 15
generated: "2026-02-01T12:00:00.000Z"
---

# Content starts here
```

---

## File Formats

### JSON (JavaScript Object Notation)

A lightweight data interchange format. OneTab Importer uses JSON for:
- **Input**: DevTools export files
- **Storage**: Master data (`master.json`)
- **Output**: Search results (optional)

---

### Markdown

A lightweight markup language for creating formatted text. OneTab Importer exports to Markdown for human-readable archives.

**Elements used**:
- Headings (`#`, `##`, `###`)
- Links (`[title](url)`)
- Lists (`- item`)
- Blockquotes (`> text`)

---

### LevelDB Files

The files that make up a LevelDB database:

| File | Purpose |
|------|---------|
| `CURRENT` | Points to the current manifest |
| `MANIFEST-*` | Database manifest |
| `*.log` | Write-ahead log |
| `*.ldb` or `*.sst` | Sorted String Tables (data) |
| `LOCK` | Prevents concurrent access |

---

## CLI Terms

### Command

A specific action in the CLI tool. OneTab Importer has these commands:

| Command | Purpose |
|---------|---------|
| `import` | Import data from JSON or LevelDB |
| `export` | Export to Markdown |
| `search` | Search through data |
| `domains` | List top domains |
| `script` | Print DevTools extraction script |
| `debug` | Debug utilities |
| `info` | Show configuration |

---

### Option / Flag

A parameter that modifies a command's behavior. Options typically start with `--` (long form) or `-` (short form).

```bash
npm run start -- search --query "react" --format json
                         ↑ long form      ↑ long form

npm run start -- search -q "react" -f json
                         ↑ short    ↑ short
```

---

### Argument

A positional value passed to a command (not named with `--`).

```bash
npm run start -- debug list-keys ./leveldb-copy
                                 ↑ argument
```

---

### npm run

A way to execute scripts defined in `package.json`. The `--` separates npm's arguments from the script's arguments.

```bash
npm run start -- import --input file.json
         ↑ script ↑      ↑ script's arguments
```

---

### stdout / stderr

Standard output streams in the terminal:
- **stdout**: Normal output (results, success messages)
- **stderr**: Error output (error messages, warnings)

---

## Related Documentation

- [Tech Stack](../overview/TECH_STACK.md) — Technologies explained
- [Architecture](../overview/ARCHITECTURE.md) — System design
- [Data Schema](../DATA_SCHEMA.md) — Data format details
