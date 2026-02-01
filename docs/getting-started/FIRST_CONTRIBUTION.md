# First Contribution

## Table of Contents

- [Overview](#overview)
- [Finding Something to Work On](#finding-something-to-work-on)
- [Setting Up for Development](#setting-up-for-development)
- [Making Your First Change](#making-your-first-change)
- [Example: Adding a New CLI Option](#example-adding-a-new-cli-option)
- [Submitting Your Change](#submitting-your-change)
- [What Happens Next](#what-happens-next)

---

## Overview

This guide walks you through making your first contribution to OneTab Importer, from setting up your environment to submitting a pull request.

**What you'll learn**:
- How to set up your development environment
- The project's code structure
- How to make and test changes
- How to submit a pull request

**Prerequisites**:
- [Installation](./INSTALLATION.md) completed
- Git installed and configured
- A GitHub account

---

## Finding Something to Work On

### Good First Issues

Look for issues labeled **"good first issue"** on GitHub:
https://github.com/eocampo/OneTabImporter/labels/good%20first%20issue

These are specifically selected for newcomers to the project.

### Suggested First Contributions

If there are no open "good first issue" items, here are some ideas:

| Contribution | Difficulty | Files to Modify |
|-------------|------------|-----------------|
| Add a new search filter | Easy | `src/commands/search.ts`, `src/cli.ts` |
| Improve error messages | Easy | Any command file |
| Add tests | Medium | New files in `tests/` |
| Add configuration file support | Medium | New file, `src/cli.ts` |
| Add export format (CSV, HTML) | Medium | `src/commands/export.ts` |

---

## Setting Up for Development

### 1. Fork the Repository

1. Go to https://github.com/eocampo/OneTabImporter
2. Click the **Fork** button (top right)
3. This creates your own copy at `https://github.com/YOUR-USERNAME/OneTabImporter`

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/OneTabImporter.git
cd OneTabImporter
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/eocampo/OneTabImporter.git
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Start Development Mode

```bash
npm run dev
```

This watches for file changes and recompiles automatically.

> 💡 **Tip**: Keep this running in a separate terminal while you work.

---

## Making Your First Change

### 1. Create a Branch

```bash
# Make sure you're on main
git checkout main

# Pull latest changes
git pull upstream main

# Create a new branch for your feature
git checkout -b feature/my-first-contribution
```

**Branch naming conventions**:
- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes

### 2. Make Your Changes

Edit the relevant files. See [Code Structure](../development/CODE_STRUCTURE.md) to find the right files.

### 3. Test Your Changes

```bash
# Rebuild after changes (if not using dev mode)
npm run build

# Test your changes manually
npm run start -- [your-command]
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add description of your change"
```

**Commit message format**:
- `feat: ...` — New feature
- `fix: ...` — Bug fix
- `docs: ...` — Documentation
- `refactor: ...` — Code refactoring
- `test: ...` — Tests

---

## Example: Adding a New CLI Option

Let's walk through adding a `--limit` option to the search command to limit results.

### Step 1: Understand the Current Code

Look at `src/commands/search.ts`:

```typescript
// src/commands/search.ts (lines 204-227)
export async function searchCommand(options: SearchOptions): Promise<void> {
  // ... validation and loading ...
  const results = searchData(masterData, options);
  // ... output formatting ...
}
```

### Step 2: Add the Option Type

Edit `src/models/types.ts`:

```typescript
// src/models/types.ts
export interface SearchOptions {
  query?: string;
  urlPattern?: string;
  titlePattern?: string;
  domain?: string;
  from?: string;
  to?: string;
  format?: 'console' | 'json' | 'markdown';
  input?: string;
  limit?: number;  // Add this line
}
```

### Step 3: Add the CLI Option

Edit `src/cli.ts`:

```typescript
// src/cli.ts (around line 82)
program
  .command('search')
  .description('Search through OneTab data')
  .option('-q, --query <text>', 'Search query')
  .option('-u, --url-pattern <regex>', 'URL pattern')
  .option('-t, --title-pattern <regex>', 'Title pattern')
  .option('-d, --domain <domain>', 'Domain filter')
  .option('--from <date>', 'Filter from date')
  .option('--to <date>', 'Filter to date')
  .option('--limit <number>', 'Limit results', parseInt)  // Add this line
  .option('-f, --format <format>', 'Output format', 'console')
  .option('-i, --input <path>', 'Master JSON input path', DEFAULT_PATHS.masterJson)
  .action(async (options) => {
    // ...
  });
```

### Step 4: Use the Option

Edit `src/commands/search.ts`:

```typescript
// src/commands/search.ts (around line 242)
// Load and search
const masterData = await readJson<MasterData>(inputPath);
let results = searchData(masterData, options);

// Add this: Apply limit if specified
if (options.limit && options.limit > 0) {
  results = results.slice(0, options.limit);
}

console.log(chalk.green(`✅ Found ${results.length} matches`));
```

### Step 5: Test Your Change

```bash
# Rebuild
npm run build

# Test the new option
npm run start -- search --query "github" --limit 5
```

### Step 6: Commit

```bash
git add .
git commit -m "feat(search): add --limit option to restrict result count"
```

---

## Submitting Your Change

### 1. Push Your Branch

```bash
git push origin feature/my-first-contribution
```

### 2. Create a Pull Request

1. Go to your fork on GitHub
2. Click **"Compare & pull request"**
3. Fill in the PR template:

```markdown
## Description
Add a --limit option to the search command to restrict the number of results.

## Changes
- Added `limit` property to `SearchOptions` interface
- Added `--limit` CLI option to search command
- Applied limit to search results before display

## Testing
- [x] Tested with `npm run start -- search -q "test" --limit 5`
- [x] Verified results are correctly limited
```

4. Click **"Create pull request"**

### 3. Address Review Feedback

If the maintainers request changes:

```bash
# Make the requested changes
# Commit them
git add .
git commit -m "fix: address review feedback"

# Push to update the PR
git push origin feature/my-first-contribution
```

---

## What Happens Next

1. **Automated Checks**: CI may run tests and linting
2. **Code Review**: A maintainer will review your code
3. **Feedback**: You may receive requests for changes
4. **Merge**: Once approved, your PR will be merged
5. **Celebration**: You're now a contributor! 🎉

---

## Tips for Success

### Do

- ✅ Read existing code to match the style
- ✅ Test your changes thoroughly
- ✅ Write clear commit messages
- ✅ Keep changes focused (one feature per PR)
- ✅ Ask questions if you're unsure

### Don't

- ❌ Make unrelated changes in the same PR
- ❌ Break existing functionality
- ❌ Ignore review feedback
- ❌ Submit without testing

---

## Getting Help

- **Code questions**: Open a GitHub Discussion
- **Bug reports**: Open a GitHub Issue
- **Stuck on setup**: Check [Troubleshooting](../guides/TROUBLESHOOTING.md)

---

## Related Documentation

- [Code Structure](../development/CODE_STRUCTURE.md) — Understand the codebase
- [Coding Standards](../development/CODING_STANDARDS.md) — Style guidelines
- [Workflows](../development/WORKFLOWS.md) — Git workflow details
