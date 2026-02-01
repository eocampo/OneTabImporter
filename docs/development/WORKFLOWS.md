# Git Workflows

## Table of Contents

- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Release Process](#release-process)

---

## Branching Strategy

### Main Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code, always stable |

### Feature Branches

All development happens in feature branches:

```
main
 └── feature/add-csv-export
 └── fix/leveldb-parse-error
 └── docs/update-readme
```

### Branch Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/add-limit-option` |
| `fix/` | Bug fixes | `fix/date-parsing-error` |
| `docs/` | Documentation | `docs/add-api-reference` |
| `refactor/` | Code refactoring | `refactor/simplify-parser` |
| `test/` | Adding tests | `test/add-search-tests` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |

### Creating a Branch

```bash
# Make sure you're on main
git checkout main
git pull origin main

# Create your branch
git checkout -b feature/your-feature-name
```

---

## Commit Messages

### Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring |
| `test` | Adding or fixing tests |
| `chore` | Maintenance, dependencies |

### Scopes

Optional scope indicates the area affected:

| Scope | Area |
|-------|------|
| `cli` | CLI entry point |
| `import` | Import command |
| `export` | Export command |
| `search` | Search command |
| `parser` | JSON or LevelDB parsers |
| `types` | Type definitions |
| `utils` | Utility functions |

### Examples

```bash
# Feature
git commit -m "feat(search): add --limit option to restrict results"

# Bug fix
git commit -m "fix(parser): handle double-encoded JSON in LevelDB"

# Documentation
git commit -m "docs: add installation guide"

# Refactoring
git commit -m "refactor(export): simplify date grouping logic"

# Multi-line with body
git commit -m "feat(cli): add configuration file support

Add support for onetab.config.json to persist user preferences.
This replaces the need for repeated command-line options.

Closes #42"
```

### Commit Best Practices

- ✅ **Atomic commits**: One logical change per commit
- ✅ **Present tense**: "add feature" not "added feature"
- ✅ **Imperative mood**: "fix bug" not "fixes bug"
- ✅ **Under 50 chars**: For the subject line
- ❌ **No period**: At end of subject line

---

## Pull Request Process

### Before Creating a PR

1. **Sync with main**:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Test your changes**:
   ```bash
   npm run build
   npm run start -- [command]
   ```

3. **Clean up commits** (optional):
   ```bash
   git rebase -i main
   ```

### Creating a Pull Request

1. Push your branch:
   ```bash
   git push origin feature/your-feature
   ```

2. Go to GitHub and click "Compare & pull request"

3. Fill in the PR template:

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring
- [ ] Other (describe)

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe how you tested these changes:
- [ ] Tested locally with `npm run start`
- [ ] Built successfully with `npm run build`
- [ ] Added/updated documentation

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #<issue-number>
```

### PR Best Practices

- ✅ **Small, focused PRs**: One feature or fix per PR
- ✅ **Clear title**: Describe what the PR does
- ✅ **Update docs**: If behavior changes
- ✅ **Test locally**: Before submitting
- ❌ **Don't mix concerns**: Refactoring + features in same PR

---

## Code Review Guidelines

### For Authors

1. **Self-review first**: Review your own code before requesting review
2. **Respond to feedback**: Address all comments
3. **Be open to suggestions**: Reviewers may have good ideas
4. **Keep PRs small**: Easier to review and merge

### For Reviewers

#### What to Look For

| Category | Check |
|----------|-------|
| **Correctness** | Does the code work? Edge cases handled? |
| **Style** | Follows project coding standards? |
| **Types** | Proper TypeScript types used? |
| **Errors** | Errors handled appropriately? |
| **Performance** | Any obvious inefficiencies? |
| **Security** | Any security concerns? |

#### Review Comments

Use prefixes to indicate severity:

| Prefix | Meaning |
|--------|---------|
| `blocking:` | Must fix before merge |
| `suggestion:` | Consider this improvement |
| `question:` | Need clarification |
| `nitpick:` | Minor style issue |
| `praise:` | Something well done! |

**Example comments**:

```
blocking: This will throw an error if `options.input` is undefined.
Consider adding a null check.

suggestion: This could be simplified using optional chaining:
`const title = group.title ?? 'Untitled';`

question: Why is this timeout set to 5000ms? Is this based on testing?

nitpick: Extra blank line here

praise: Great error message! Very helpful for debugging.
```

### Merging

1. **Squash and merge**: Preferred for clean history
2. **Update branch**: Rebase on main before merge
3. **Delete branch**: After merge

---

## Release Process

> ℹ️ **Note**: This project doesn't currently have a formal release process. Below is a suggested workflow.

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Release Checklist

```markdown
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG updated (if exists)
- [ ] Version bumped in package.json
- [ ] Tag created (`v1.0.0`)
- [ ] Release notes written
```

### Creating a Release

```bash
# Update version
npm version minor  # or major, patch

# Push with tags
git push origin main --tags
```

---

## Common Git Commands

### Daily Workflow

```bash
# Start new work
git checkout main
git pull
git checkout -b feature/my-feature

# Save progress
git add .
git commit -m "feat: description"

# Push for backup/review
git push origin feature/my-feature
```

### Sync with Main

```bash
git checkout main
git pull
git checkout feature/my-feature
git rebase main
# Resolve conflicts if any
git push --force-with-lease
```

### Fix Last Commit

```bash
# Amend message
git commit --amend -m "new message"

# Add forgotten file
git add forgotten-file.ts
git commit --amend --no-edit
```

### Undo Changes

```bash
# Discard uncommitted changes
git checkout -- filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

---

## Related Documentation

- [First Contribution](../getting-started/FIRST_CONTRIBUTION.md) — Getting started with contributing
- [Coding Standards](./CODING_STANDARDS.md) — Code style guidelines
