# Installation

## Table of Contents

- [Quick Start](#quick-start)
- [Step-by-Step Installation](#step-by-step-installation)
- [Verifying Installation](#verifying-installation)
- [Updating](#updating)
- [Uninstalling](#uninstalling)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/eocampo/OneTabImporter.git

# Navigate to the project directory
cd OneTabImporter

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Verify installation
npm run start -- --version
```

---

## Step-by-Step Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/eocampo/OneTabImporter.git
```

This creates a new folder called `OneTabImporter` with all the project files.

<details>
<summary>📝 <strong>Alternative: Download ZIP</strong></summary>

If you don't want to use Git:
1. Go to https://github.com/eocampo/OneTabImporter
2. Click the green "Code" button
3. Select "Download ZIP"
4. Extract the ZIP file to your desired location
</details>

### Step 2: Navigate to Project Directory

```bash
cd OneTabImporter
```

You should see these files:
```
OneTabImporter/
├── package.json
├── tsconfig.json
├── src/
├── scripts/
├── docs/
└── ...
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs all required packages listed in `package.json`:
- `commander` — CLI framework
- `classic-level` — LevelDB parser
- `chalk` — Terminal colors
- `typescript` — TypeScript compiler (dev dependency)

**Expected output**:
```
added 35 packages, and audited 36 packages in 5s

found 0 vulnerabilities
```

> ⚠️ **Note**: On some systems, `classic-level` requires compilation of native modules. If you see build errors, ensure you have build tools installed:
> - **Windows**: Install Visual Studio Build Tools
> - **macOS**: Install Xcode Command Line Tools (`xcode-select --install`)
> - **Linux**: Install `build-essential` (`sudo apt-get install build-essential`)

### Step 4: Build the Project

```bash
npm run build
```

This compiles TypeScript files to JavaScript:
- Source: `src/*.ts`
- Output: `dist/*.js`

**Expected output**:
```
# No output means success!
# Check that dist/ folder was created
```

### Step 5: Verify Installation

```bash
npm run start -- --version
```

**Expected output**:
```
1.0.0
```

Or run the help command:
```bash
npm run start -- --help
```

**Expected output**:
```
Usage: onetab [options] [command]

Import and manage OneTab links with timestamps

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  import          Import OneTab data from JSON export or LevelDB
  export          Export master data to Markdown files
  search          Search through OneTab data
  domains         List all unique domains with counts
  script          Print the DevTools extraction script
  debug           Debug utilities
  info            Show configuration and paths
  help [command]  display help for command
```

---

## Verifying Installation

### Run All Checks

```bash
# Check that the project builds
npm run build

# Check that the CLI runs
npm run start -- --help

# Check configuration info
npm run start -- info
```

### Expected `info` Output

```
📋 OneTab Importer Configuration

Default Extension IDs:
  Edge:   hoimpamkkoehapgenciaoajfkfkpgfop
  Chrome: chphlpgkkbolifaimnlloiipkdnihall

Default Paths:
  Master JSON:  ./data/master.json
  Output Dir:   ./output
  LevelDB Copy: ./leveldb-copy

Browser LevelDB Locations (Windows):
  Edge:   C:\Users\...\AppData\Local\Microsoft\Edge\User Data\Default\Local Extension Settings\hoimpamkkoehapgenciaoajfkfkpgfop
  Chrome: C:\Users\...\AppData\Local\Google\Chrome\User Data\Default\Local Extension Settings\chphlpgkkbolifaimnlloiipkdnihall
```

---

## Updating

To update to the latest version:

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies (in case they changed)
npm install

# Rebuild
npm run build
```

---

## Uninstalling

To remove OneTab Importer:

```bash
# Navigate to parent directory
cd ..

# Remove the project folder
rm -rf OneTabImporter   # Linux/macOS
rmdir /s OneTabImporter # Windows
```

Your `data/master.json` and exported files will be deleted too. Back them up first if needed.

---

## Troubleshooting

### npm install Fails

#### Error: EACCES permission denied

**Solution** (Linux/macOS):
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install
```

**Better solution**: Use nvm (Node Version Manager) to manage Node.js.

#### Error: node-gyp rebuild failed

This error occurs when compiling native modules (like `classic-level`).

**Windows**:
```powershell
# Install build tools
npm install --global --production windows-build-tools
```

**macOS**:
```bash
xcode-select --install
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install build-essential
```

### npm run build Fails

#### Error: Cannot find module 'typescript'

**Solution**:
```bash
# Reinstall dev dependencies
npm install --include=dev
```

#### Error: Unknown file extension ".ts"

**Solution**: Make sure you're running the compiled JavaScript, not TypeScript:
```bash
npm run build  # Compile first
npm run start -- --help  # Run compiled version
```

### Command Not Found: onetab

The `onetab` command is only available if you install globally:
```bash
npm link  # Creates global symlink
onetab --help  # Now works globally
```

For local usage, always use:
```bash
npm run start -- [command]
```

---

## Project Structure After Installation

After successful installation, your project should look like this:

```
OneTabImporter/
├── dist/                  # Compiled JavaScript (created by build)
│   ├── cli.js
│   ├── commands/
│   ├── parsers/
│   ├── models/
│   └── utils/
├── node_modules/          # Dependencies (created by npm install)
├── data/                  # Data storage
│   └── .gitkeep
├── src/                   # TypeScript source files
├── scripts/               # Utility scripts
├── docs/                  # Documentation
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## Next Steps

Now that you have the project installed:

➡️ Continue to [Configuration](./CONFIGURATION.md) to learn about configuration options

Or jump ahead to:
- [Running the App](./RUNNING_THE_APP.md) — Start using the CLI
- [First Contribution](./FIRST_CONTRIBUTION.md) — Make your first code change
