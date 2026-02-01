# Frequently Asked Questions

## Table of Contents

- [General Questions](#general-questions)
- [Data and Privacy](#data-and-privacy)
- [Import Questions](#import-questions)
- [Export Questions](#export-questions)
- [Technical Questions](#technical-questions)
- [Contributing Questions](#contributing-questions)

---

## General Questions

### What is OneTab Importer?

OneTab Importer is a command-line tool that extracts your saved tabs from the [OneTab browser extension](https://www.one-tab.com/) and converts them to searchable JSON and human-readable Markdown formats—while preserving the original timestamps of when you saved each group of tabs.

---

### Why would I need this tool?

**Common use cases**:

| Use Case | Problem | Solution |
|----------|---------|----------|
| **Backup** | Fear of losing tabs if browser crashes | Export to JSON/Markdown files |
| **Search** | Can't find tabs saved months ago | Search by keyword, domain, or date |
| **Archive** | Want to organize tabs by date | Export to monthly Markdown files |
| **Analysis** | Curious which sites you save most | Use the `domains` command |
| **Migration** | Moving to a new computer | Export and re-import later |

---

### Does this tool sync with the cloud?

No. OneTab Importer is a local-only tool. It doesn't connect to any cloud services. Your data stays on your computer.

If you want cloud backup, export your data and manually sync the files using your preferred cloud storage (Dropbox, Google Drive, etc.).

---

### Does this work on macOS or Linux?

**Partially**:

| Feature | macOS | Linux | Windows |
|---------|-------|-------|---------|
| DevTools export | ✅ Yes | ✅ Yes | ✅ Yes |
| JSON import | ✅ Yes | ✅ Yes | ✅ Yes |
| Markdown export | ✅ Yes | ✅ Yes | ✅ Yes |
| Search | ✅ Yes | ✅ Yes | ✅ Yes |
| LevelDB copy script | ❌ No | ❌ No | ✅ Yes |

The PowerShell copy script (`copy-leveldb.ps1`) only works on Windows. On macOS/Linux, use the DevTools export method instead.

---

### Which browsers are supported?

| Browser | Supported | Notes |
|---------|-----------|-------|
| Microsoft Edge | ✅ Yes | Full support |
| Google Chrome | ✅ Yes | Full support |
| Brave | ⚠️ Untested | May work (Chromium-based) |
| Firefox | ❌ No | Different extension format |
| Safari | ❌ No | OneTab not available |

---

## Data and Privacy

### Where is my data stored?

| Location | Contents |
|----------|----------|
| `./data/master.json` | All your imported tab data |
| `./output/` | Exported Markdown files |
| `./leveldb-copy/` | Temporary copy of browser storage (deleted manually) |

Nothing is sent to external servers. All data stays local.

---

### Is my data safe?

**Security considerations**:

- ✅ All data stays on your computer
- ✅ No network requests to external services
- ✅ Open source code you can audit
- ⚠️ The JSON file is unencrypted (don't commit sensitive URLs to public repos)

---

### Can I delete my data?

Yes:

```bash
# Delete imported data
rm ./data/master.json

# Delete exported markdown
rm -rf ./output/

# Delete temporary LevelDB copy
rm -rf ./leveldb-copy/
```

---

### Does this tool access my browser history?

No. It only accesses OneTab's storage—the tabs you've explicitly saved to OneTab. It doesn't touch your browser history, bookmarks, or any other browser data.

---

## Import Questions

### Why do I need to use DevTools? Can't it just read automatically?

Browser security prevents extensions and external programs from accessing each other's data. The DevTools console is the only way to access OneTab's internal storage without modifying the extension itself.

---

### Why don't the built-in OneTab export/import preserve timestamps?

OneTab's built-in "Export URLs" feature only exports the URLs and titles as plain text. The timestamps are stored separately in the extension's internal database and aren't included in the text export.

Our DevTools script reads directly from the internal storage, which includes timestamps.

---

### Can I import my existing OneTab text export?

Not directly. If you have a text export from OneTab, it doesn't include timestamps. You would need to:

1. Use the DevTools method to get a proper export with timestamps
2. Or accept that imported tabs will have the current date

---

### How do I import from multiple browsers?

Import from each browser separately—they will be merged automatically:

```bash
# Import from Edge
npm run start -- import --input edge-export.json

# Import from Chrome (merges with existing)
npm run start -- import --input chrome-export.json
```

Duplicate tabs (same ID) won't be duplicated.

---

### What if I re-import the same data?

The importer detects duplicates by group ID. Re-importing the same data won't create duplicates:

```
📂 Found existing master data, merging...
ℹ️  No new groups to add
```

---

## Export Questions

### What format is the exported Markdown?

The Markdown includes:
- YAML frontmatter with metadata
- Groups organized by date
- Clickable links for each tab

Example:
```markdown
---
period: "2026-02"
totalGroups: 15
---

# OneTab Links: 2026-02

### Feb 1, 2026, 10:03 AM ⭐
- [GitHub](https://github.com)
- [Stack Overflow](https://stackoverflow.com)
```

---

### Can I export to other formats (CSV, HTML)?

Not currently. The tool exports to JSON (machine-readable) and Markdown (human-readable).

**Workarounds**:
- Use the JSON output with other tools
- Convert Markdown to HTML with pandoc: `pandoc output.md -o output.html`
- This is a good opportunity for contribution!

---

### Why are my exports organized by month?

Month is the default. You can change it:

```bash
# By week
npm run start -- export --group-by week

# By day
npm run start -- export --group-by day

# Single file
npm run start -- export --single
```

---

### Can I exclude certain tabs or domains from export?

Not directly through the CLI. You would need to:

1. Edit `master.json` manually to remove unwanted tabs
2. Or filter using search and export the results:
   ```bash
   npm run start -- search --domain "work.example.com" --format markdown
   ```

---

## Technical Questions

### What is LevelDB?

LevelDB is a fast key-value storage database created by Google. Chromium-based browsers (Chrome, Edge, Brave) use it to store extension data, including OneTab's saved tabs.

---

### Why does the LevelDB copy require closing the browser?

LevelDB locks its files while in use. The browser holds this lock as long as it's running. Copying locked files can result in corrupted data, so we require the browser to be closed first.

---

### What Node.js version do I need?

Node.js 20 or higher (LTS recommended).

Check your version:
```bash
node --version
# Should be v20.x.x or higher
```

---

### Can I run this as a scheduled task?

Yes, using the DevTools export method:

1. Manually export from browser (DevTools script)
2. Set up a scheduled task to run import/export

```bash
# Example cron job (Linux/macOS)
0 2 * * 0 cd /path/to/OneTabImporter && npm run start -- export >> /var/log/onetab.log 2>&1
```

Automated browser access isn't possible due to security restrictions.

---

### Is there a GUI version?

No. This is a command-line tool designed for automation and scripting. A GUI version would be a significant undertaking and isn't currently planned.

---

## Contributing Questions

### How can I contribute?

1. Read [First Contribution](../getting-started/FIRST_CONTRIBUTION.md)
2. Check [open issues](https://github.com/eocampo/OneTabImporter/issues)
3. Look for "good first issue" labels

**Good first contributions**:
- Improve error messages
- Add new search filters
- Add tests
- Fix documentation

---

### Is there a test suite?

Not currently. Adding tests would be a valuable contribution! See the existing code structure to understand how components work.

---

### Can I add support for Firefox?

Firefox uses a different extension storage format. It would require:
1. Researching Firefox's extension storage location
2. Creating a new parser for Firefox's format
3. Adapting the copy script for Firefox

This would be a significant contribution—see [First Contribution](../getting-started/FIRST_CONTRIBUTION.md) to get started.

---

### How do I report a bug?

1. Check [existing issues](https://github.com/eocampo/OneTabImporter/issues)
2. If not reported, [create a new issue](https://github.com/eocampo/OneTabImporter/issues/new)
3. Include:
   - What you expected
   - What happened
   - Steps to reproduce
   - Error messages
   - Environment (OS, Node version, browser)

---

## More Questions?

If your question isn't answered here:

1. Check [Troubleshooting](./TROUBLESHOOTING.md) for common problems
2. Read the [Architecture](../overview/ARCHITECTURE.md) for technical understanding
3. Open an issue on GitHub

---

## Related Documentation

- [Project Overview](../overview/PROJECT_OVERVIEW.md) — What this project does
- [Running the App](../getting-started/RUNNING_THE_APP.md) — How to use it
- [Troubleshooting](./TROUBLESHOOTING.md) — Common problems
