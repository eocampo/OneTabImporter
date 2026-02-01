# Debugging

## Table of Contents

- [Development Setup](#development-setup)
- [Common Debugging Scenarios](#common-debugging-scenarios)
- [Debugging Tools](#debugging-tools)
- [Logging and Output](#logging-and-output)
- [Inspecting Data](#inspecting-data)
- [TypeScript Errors](#typescript-errors)
- [Runtime Errors](#runtime-errors)

---

## Development Setup

### Watch Mode

Run TypeScript in watch mode for automatic recompilation:

```bash
npm run dev
```

This watches for file changes and recompiles automatically. Keep this running in a separate terminal while developing.

### Quick Test Cycle

```bash
# Terminal 1: Watch mode
npm run dev

# Terminal 2: Run commands
npm run start -- [command]
```

---

## Common Debugging Scenarios

### Issue: Command Not Found

**Symptom**: `'onetab' is not recognized as a command`

**Solutions**:

1. **Use npm scripts instead**:
   ```bash
   # Instead of: onetab import
   npm run start -- import
   ```

2. **Link globally** (optional):
   ```bash
   npm link
   onetab import  # Now works
   ```

### Issue: TypeScript Compilation Errors

**Symptom**: `npm run build` shows errors

**Debug steps**:

1. **Check the specific error**:
   ```bash
   npm run build
   # Read the error message carefully
   ```

2. **Common fixes**:
   - Missing import: Add the import statement
   - Type mismatch: Fix the type annotation
   - Missing property: Update interface or add optional `?`

### Issue: Import/Export Fails

**Symptom**: Error when running import or export

**Debug steps**:

1. **Check file paths**:
   ```bash
   # Verify input file exists
   ls -la ./data/master.json
   
   # Verify output directory is writable
   ls -la ./output/
   ```

2. **Use debug commands**:
   ```bash
   # Check what's in the input file
   head -100 ./data/master.json
   
   # For LevelDB, list keys
   npm run start -- debug list-keys ./leveldb-copy
   ```

### Issue: LevelDB Parse Fails

**Symptom**: Error reading LevelDB data

**Debug steps**:

1. **Ensure browser is closed**:
   ```bash
   # Check for running browser processes (Windows)
   tasklist | findstr /i "msedge chrome"
   
   # Kill if needed
   taskkill /im msedge.exe /f
   ```

2. **Verify LevelDB copy**:
   ```bash
   # Check files were copied
   ls -la ./leveldb-copy/
   
   # Look for CURRENT file
   cat ./leveldb-copy/CURRENT
   ```

3. **Dump raw data**:
   ```bash
   npm run start -- debug dump ./leveldb-copy -o debug-dump.json
   cat debug-dump.json
   ```

---

## Debugging Tools

### Built-in Debug Commands

The CLI includes debug utilities:

```bash
# List all keys in LevelDB
npm run start -- debug list-keys ./leveldb-copy

# Dump entire LevelDB to JSON
npm run start -- debug dump ./leveldb-copy -o dump.json

# Show configuration
npm run start -- info
```

### Node.js Inspector

Run with Node.js debugger:

```bash
# Start with inspector
node --inspect dist/cli.js import --input test.json

# Open Chrome DevTools: chrome://inspect
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Import",
      "program": "${workspaceFolder}/dist/cli.js",
      "args": ["import", "--input", "test-data.json"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Export",
      "program": "${workspaceFolder}/dist/cli.js",
      "args": ["export"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true
    }
  ]
}
```

Then:
1. Set breakpoints in `.ts` files
2. Press F5 or click "Start Debugging"
3. Step through code

---

## Logging and Output

### Adding Debug Logs

Temporarily add logging to trace execution:

```typescript
// src/commands/import.ts

export async function importCommand(options: ImportOptions): Promise<void> {
  console.log('[DEBUG] Options:', JSON.stringify(options, null, 2));
  
  const rawData = await readJson(inputPath);
  console.log('[DEBUG] Raw data keys:', Object.keys(rawData as object));
  
  // ...
}
```

> ⚠️ **Remember**: Remove debug logs before committing!

### Verbose Output Pattern

A pattern for optional verbose logging:

```typescript
// Add to options
export interface ImportOptions {
  // ... existing options
  verbose?: boolean;
}

// In command
function log(message: string, verbose: boolean) {
  if (verbose) {
    console.log(chalk.gray(`[DEBUG] ${message}`));
  }
}

export async function importCommand(options: ImportOptions): Promise<void> {
  const verbose = options.verbose ?? false;
  
  log(`Input path: ${options.input}`, verbose);
  log(`Browser: ${options.browser}`, verbose);
  // ...
}
```

---

## Inspecting Data

### Viewing Master Data

```bash
# View the full file
cat ./data/master.json

# Pretty print with jq (if installed)
cat ./data/master.json | jq .

# View just statistics
cat ./data/master.json | jq '.stats'

# View first group
cat ./data/master.json | jq '.groups[0]'
```

### Using Node REPL

```bash
node
```

```javascript
// In Node REPL
const fs = require('fs');

// Load master data
const data = JSON.parse(fs.readFileSync('./data/master.json', 'utf-8'));

// Explore
console.log(data.stats);
console.log(data.groups.length);
console.log(data.groups[0].tabs.slice(0, 5));

// Find specific data
const github = data.groups.flatMap(g => g.tabs).filter(t => t.domain === 'github.com');
console.log(github.length, 'GitHub tabs');
```

### Testing Parser Functions

```bash
node
```

```javascript
// Test date utilities
const { epochToIso, parseFlexibleDate } = await import('./dist/utils/dates.js');

epochToIso(1706799999999);
parseFlexibleDate('2025-06');
parseFlexibleDate('2025-06', true);  // End of period
```

---

## TypeScript Errors

### Understanding Error Messages

**Example error**:
```
src/commands/import.ts:45:23 - error TS2345: 
Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.
```

**Translation**: You're passing `options.input` which might be `undefined`, but the function expects a definite `string`.

**Fix**:
```typescript
// Add a check before using
if (!options.input) {
  throw new Error('Input is required');
}
// Now TypeScript knows it's defined
const data = await readFile(options.input);
```

### Common Type Errors

| Error | Meaning | Fix |
|-------|---------|-----|
| `Type 'X' is not assignable to type 'Y'` | Wrong type | Check types, add conversion |
| `Property 'x' does not exist on type 'Y'` | Missing property | Add to interface or check existence |
| `Object is possibly 'undefined'` | Null check needed | Add `if` check or use `?.` |
| `Argument of type 'unknown'` | Need to validate | Add type guard or assertion |

### Quick Fixes (Use Sparingly)

```typescript
// Type assertion (when you're sure)
const groups = data.groups as TabGroup[];

// Non-null assertion (when you know it exists)
const firstGroup = groups[0]!;

// Any escape hatch (avoid if possible)
const mystery = data as any;
```

---

## Runtime Errors

### Stack Traces

When an error occurs, read the stack trace bottom-up:

```
Error: Invalid OneTab export: tabGroups is not an array
    at validateOneTabExport (file:///project/dist/parsers/json.js:67:15)
    at parseOneTabJson (file:///project/dist/parsers/json.js:95:23)
    at importCommand (file:///project/dist/commands/import.ts:42:20)
    at ...
```

**Reading this**:
1. Error was thrown in `validateOneTabExport`
2. Called from `parseOneTabJson`
3. Called from `importCommand`
4. The actual error: "tabGroups is not an array"

### Common Runtime Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ENOENT: no such file` | File not found | Check path, ensure file exists |
| `EACCES: permission denied` | Can't read/write | Check file permissions |
| `SyntaxError: Unexpected token` | Invalid JSON | Validate JSON format |
| `TypeError: Cannot read property of undefined` | Null/undefined access | Add null checks |

### Debugging JSON Parse Errors

```bash
# Validate JSON syntax
cat data.json | node -e "JSON.parse(require('fs').readFileSync(0, 'utf-8'))"

# Find syntax error location
npm install -g jsonlint
jsonlint data.json
```

---

## Performance Debugging

### Timing Operations

```typescript
// Add timing
console.time('parse');
const data = parseOneTabJson(rawData);
console.timeEnd('parse');
// Output: parse: 45.123ms
```

### Memory Usage

```typescript
// Check memory
const used = process.memoryUsage();
console.log(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
```

### Profiling

```bash
# Run with profiler
node --prof dist/cli.js import --input large-data.json

# Process the output
node --prof-process isolate-*.log > profile.txt
```

---

## Related Documentation

- [Troubleshooting](../guides/TROUBLESHOOTING.md) — Common issues and solutions
- [Code Structure](./CODE_STRUCTURE.md) — Understanding the codebase
- [Running the App](../getting-started/RUNNING_THE_APP.md) — Usage guide
