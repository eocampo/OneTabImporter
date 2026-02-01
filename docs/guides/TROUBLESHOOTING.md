# Troubleshooting

## Table of Contents

- [Installation Issues](#installation-issues)
- [Import Issues](#import-issues)
- [Export Issues](#export-issues)
- [Search Issues](#search-issues)
- [LevelDB Issues](#leveldb-issues)
- [Build Issues](#build-issues)
- [Getting More Help](#getting-more-help)

---

## Installation Issues

### npm install fails with EACCES permission denied

**Symptom**:
```
npm ERR! Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
```

**Cause**: npm is trying to install globally in a protected directory.

**Solutions**:

1. **Fix npm permissions** (recommended):
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   npm install
   ```

2. **Use nvm** (Node Version Manager):
   - Avoids permission issues entirely
   - Allows multiple Node versions

---

### npm install fails with node-gyp error

**Symptom**:
```
npm ERR! gyp ERR! build error
npm ERR! gyp ERR! stack Error: `make` failed with exit code: 2
```

**Cause**: Missing build tools required for native modules (like `classic-level`).

**Solutions by platform**:

**Windows**:
```powershell
npm install --global windows-build-tools
# Or install Visual Studio Build Tools manually
```

**macOS**:
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install build-essential
```

---

### Command not found: onetab

**Symptom**:
```
bash: onetab: command not found
```

**Cause**: The CLI isn't installed globally.

**Solutions**:

1. **Use npm run** (recommended):
   ```bash
   npm run start -- import --input file.json
   ```

2. **Install globally**:
   ```bash
   npm link
   onetab import --input file.json
   ```

---

## Import Issues

### Error: No input source specified

**Symptom**:
```
❌ No input source specified
```

**Cause**: You didn't provide an input file or LevelDB path.

**Solutions**:

```bash
# Option 1: Provide JSON file
npm run start -- import --input ~/Downloads/onetab-export.json

# Option 2: Provide LevelDB path
npm run start -- import --leveldb ./leveldb-copy

# Option 3: Use default LevelDB location
npm run copy-db  # First copy the database
npm run start -- import  # Then import from default location
```

---

### Error: Input file not found

**Symptom**:
```
❌ Input file not found: /path/to/file.json
```

**Cause**: The file path is incorrect or the file doesn't exist.

**Solutions**:

1. **Check the path**:
   ```bash
   ls -la /path/to/file.json
   ```

2. **Use absolute path**:
   ```bash
   npm run start -- import --input /home/user/Downloads/onetab-export.json
   ```

3. **Check for typos in filename**:
   ```bash
   ls -la ~/Downloads/*.json
   ```

---

### Error: Invalid OneTab export

**Symptom**:
```
Error: Invalid OneTab export: could not find tabGroups array
```

**Cause**: The JSON file doesn't have the expected structure.

**Diagnosis**:

```bash
# Check the file structure
cat your-export.json | head -50
```

**Expected structure**:
```json
{
  "state": {
    "tabGroups": [...]
  }
}
```

**Solutions**:

1. **Re-export from DevTools**:
   - Make sure you're on the OneTab page (not just any page)
   - Use the script from `npm run start -- script`

2. **Check if data is double-encoded**:
   ```bash
   # If state is a string, it's double-encoded
   cat export.json | jq 'type'
   ```

---

### Imported data has no timestamps

**Symptom**: All groups show the same date or current date.

**Cause**: OneTab's built-in export doesn't include timestamps.

**Solution**: Use the DevTools export method instead:

```bash
# Get the proper extraction script
npm run start -- script
# Run it in browser DevTools, then import
```

> ⚠️ **Note**: The "Export URLs" and "Import URLs" features in OneTab itself do NOT preserve timestamps. Only the DevTools method or LevelDB copy preserves them.

---

## Export Issues

### Error: Master data not found

**Symptom**:
```
❌ Master data not found: ./data/master.json
```

**Cause**: You haven't imported any data yet.

**Solution**:
```bash
# Import first
npm run start -- import --input your-export.json

# Then export
npm run start -- export
```

---

### No groups to export

**Symptom**:
```
⚠️ No groups to export
```

**Cause**: Your date filter excluded all groups.

**Solutions**:

1. **Check your date range**:
   ```bash
   # See what dates are in your data
   npm run start -- info
   ```

2. **Widen your filter**:
   ```bash
   npm run start -- export --from 2023-01
   ```

3. **Export without filter**:
   ```bash
   npm run start -- export
   ```

---

### Output directory permission denied

**Symptom**:
```
Error: EACCES: permission denied, mkdir './output'
```

**Cause**: Can't create/write to the output directory.

**Solutions**:

1. **Check directory permissions**:
   ```bash
   ls -la ./
   ```

2. **Create directory manually**:
   ```bash
   mkdir -p ./output
   chmod 755 ./output
   ```

3. **Use different output path**:
   ```bash
   npm run start -- export --output ~/onetab-export
   ```

---

## Search Issues

### No matches found

**Symptom**:
```
No matches found.
```

**Possible causes and solutions**:

1. **Typo in query**:
   ```bash
   # Try partial match
   npm run start -- search -q "git"  # instead of "github"
   ```

2. **Wrong date range**:
   ```bash
   # Remove date filter to search all
   npm run start -- search -q "react"
   ```

3. **Data not imported**:
   ```bash
   # Check if you have data
   npm run start -- info
   ```

---

### Regex error

**Symptom**:
```
⚠️ Invalid URL regex: [invalid
```

**Cause**: Invalid regular expression syntax.

**Solution**: Escape special characters:
```bash
# ❌ Wrong
npm run start -- search --url-pattern "github.com/user"

# ✅ Correct (escape the dot)
npm run start -- search --url-pattern "github\\.com/user"
```

---

## LevelDB Issues

### Error: LevelDB directory not found

**Symptom**:
```
❌ LevelDB directory not found: ./leveldb-copy
```

**Cause**: The LevelDB copy doesn't exist.

**Solution**:
```bash
# Run the copy script first
npm run copy-db

# Then import
npm run start -- import --leveldb ./leveldb-copy
```

---

### Error: Invalid LevelDB directory

**Symptom**:
```
Error: Invalid LevelDB directory (CURRENT file not found)
```

**Cause**: The path isn't a valid LevelDB database.

**Diagnosis**:
```bash
# Check for LevelDB files
ls -la ./leveldb-copy/
# Should contain: CURRENT, LOG, *.ldb files
```

**Solutions**:

1. **Re-run copy script**:
   ```bash
   rm -rf ./leveldb-copy
   npm run copy-db
   ```

2. **Check source path**:
   - Make sure the OneTab extension is installed
   - Check you're using the correct browser parameter

---

### Browser is running (file lock)

**Symptom**:
```
WARNING: edge appears to be running!
```
or
```
Error: LOCK file exists
```

**Cause**: Browser has the LevelDB files locked.

**Solution**:

1. **Close the browser completely**:
   - Close all windows
   - Check Task Manager for background processes
   
   ```powershell
   # Windows: Check for running processes
   tasklist | findstr /i "msedge chrome"
   
   # Kill if necessary
   taskkill /im msedge.exe /f
   ```

2. **Try again**:
   ```bash
   npm run copy-db
   ```

---

### Could not find OneTab data in LevelDB

**Symptom**:
```
Error: Could not find OneTab data in LevelDB
```

**Cause**: The LevelDB database is empty or uses a different format.

**Diagnosis**:
```bash
# See what keys exist
npm run start -- debug list-keys ./leveldb-copy

# Dump all data
npm run start -- debug dump ./leveldb-copy -o dump.json
cat dump.json
```

**Solutions**:

1. **Ensure OneTab has saved tabs**: Open the OneTab page in your browser and verify you have saved tabs

2. **Try different profile**:
   ```bash
   npm run copy-db -- -Profile "Profile 1"
   ```

3. **Use DevTools export instead**: The DevTools method is more reliable

---

## Build Issues

### TypeScript compilation errors

**Symptom**:
```
error TS2345: Argument of type 'X' is not assignable to type 'Y'
```

**Solutions**:

1. **Clean and rebuild**:
   ```bash
   rm -rf dist
   npm run build
   ```

2. **Check dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

---

### Cannot find module

**Symptom**:
```
Error: Cannot find module './commands/import.js'
```

**Cause**: TypeScript hasn't been compiled.

**Solution**:
```bash
npm run build
```

---

### Unknown file extension ".ts"

**Symptom**:
```
TypeError: Unknown file extension ".ts"
```

**Cause**: Trying to run TypeScript directly instead of compiled JavaScript.

**Solution**:
```bash
# ❌ Wrong
node src/cli.ts

# ✅ Correct
npm run build
npm run start -- [command]
```

---

## Getting More Help

### Debug Mode

Get more information about what's happening:

```bash
# List LevelDB contents
npm run start -- debug list-keys ./leveldb-copy

# Dump raw data
npm run start -- debug dump ./leveldb-copy -o debug.json
```

### Check Configuration

```bash
npm run start -- info
```

### Verify Data

```bash
# Check master data structure
cat ./data/master.json | head -100

# Using jq (if installed)
cat ./data/master.json | jq '.stats'
cat ./data/master.json | jq '.groups | length'
```

### Still Stuck?

1. **Check existing issues**: https://github.com/eocampo/OneTabImporter/issues
2. **Open a new issue** with:
   - Error message (full output)
   - Steps to reproduce
   - Your environment (OS, Node version, browser)

---

## Related Documentation

- [Debugging](../development/DEBUGGING.md) — Developer debugging techniques
- [FAQ](./FAQ.md) — Frequently asked questions
- [Running the App](../getting-started/RUNNING_THE_APP.md) — Usage guide
