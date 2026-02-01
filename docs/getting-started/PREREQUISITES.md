# Prerequisites

## Table of Contents

- [Required Software](#required-software)
- [System Requirements](#system-requirements)
- [Browser Requirements](#browser-requirements)
- [Verifying Your Setup](#verifying-your-setup)

---

## Required Software

### Node.js (Required)

| Requirement | Details |
|-------------|---------|
| **Minimum Version** | 20.0.0 |
| **Recommended** | 20.x LTS (Long Term Support) |
| **Download** | https://nodejs.org/ |

Node.js includes npm (Node Package Manager), which is used to install dependencies.

#### Installation by Operating System

<details>
<summary><strong>Windows</strong></summary>

**Option 1: Official Installer (Recommended for beginners)**
1. Download the LTS installer from https://nodejs.org/
2. Run the installer
3. Accept the license agreement
4. Keep default installation options
5. Restart your terminal

**Option 2: Using winget**
```powershell
winget install OpenJS.NodeJS.LTS
```

**Option 3: Using Chocolatey**
```powershell
choco install nodejs-lts
```
</details>

<details>
<summary><strong>macOS</strong></summary>

**Option 1: Official Installer**
1. Download the LTS installer from https://nodejs.org/
2. Run the `.pkg` file
3. Follow the installation wizard

**Option 2: Using Homebrew (Recommended)**
```bash
brew install node@20
```

**Option 3: Using nvm (Node Version Manager)**
```bash
# Install nvm first
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install 20
nvm use 20
```
</details>

<details>
<summary><strong>Linux (Ubuntu/Debian)</strong></summary>

**Option 1: Using NodeSource**
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs
```

**Option 2: Using nvm (Node Version Manager)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then install Node.js
nvm install 20
nvm use 20
```
</details>

### Git (Required for Development)

| Requirement | Details |
|-------------|---------|
| **Minimum Version** | 2.0+ |
| **Download** | https://git-scm.com/ |

Git is required to clone the repository and contribute to the project.

<details>
<summary><strong>Installation Instructions</strong></summary>

**Windows**
```powershell
winget install Git.Git
```

**macOS**
```bash
brew install git
# Or install Xcode Command Line Tools: xcode-select --install
```

**Linux (Ubuntu/Debian)**
```bash
sudo apt-get install git
```
</details>

### PowerShell (Windows Only - Optional)

| Requirement | Details |
|-------------|---------|
| **Purpose** | Running the LevelDB copy script |
| **Included** | Pre-installed on Windows 10/11 |

> ℹ️ **Note**: PowerShell is only needed if you want to use the `copy-leveldb.ps1` script. The DevTools export method works without PowerShell.

---

## System Requirements

### Minimum Requirements

| Component | Requirement |
|-----------|-------------|
| **CPU** | Any modern processor |
| **RAM** | 512 MB available |
| **Disk Space** | 100 MB for installation + data storage |
| **OS** | Windows 10+, macOS 10.15+, or Linux |

### Recommended for Large Datasets

| Component | Recommendation |
|-----------|----------------|
| **RAM** | 2 GB available (for large OneTab databases) |
| **Disk Space** | 1 GB (if you have thousands of saved tabs) |

---

## Browser Requirements

OneTab Importer supports data extraction from:

| Browser | Supported | Extension ID |
|---------|-----------|--------------|
| Microsoft Edge | ✅ Yes | `hoimpamkkoehapgenciaoajfkfkpgfop` |
| Google Chrome | ✅ Yes | `chphlpgkkbolifaimnlloiipkdnihall` |
| Firefox | ❌ No | Not supported (different extension format) |
| Other Chromium browsers | ⚠️ Untested | May work with Chrome extension ID |

### OneTab Extension

You need the OneTab extension installed with saved tabs:
- **Edge**: [OneTab in Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/onetab/hoimpamkkoehapgenciaoajfkfkpgfop)
- **Chrome**: [OneTab in Chrome Web Store](https://chrome.google.com/webstore/detail/onetab/chphlpgkkbolifaimnlloiipkdnihall)

---

## Verifying Your Setup

Run these commands to verify your prerequisites are installed:

### 1. Check Node.js Version

```bash
node --version
# Expected: v20.x.x or higher
```

### 2. Check npm Version

```bash
npm --version
# Expected: 10.x.x or higher (comes with Node.js 20)
```

### 3. Check Git Version (if contributing)

```bash
git --version
# Expected: git version 2.x.x
```

### All Checks in One Command

```bash
echo "Node.js: $(node --version)" && echo "npm: $(npm --version)" && echo "Git: $(git --version)"
```

Expected output:
```
Node.js: v20.11.0
npm: 10.2.4
Git: git version 2.43.0
```

---

## Troubleshooting Prerequisites

### Node.js Not Found

**Symptom**: `'node' is not recognized as an internal or external command`

**Solutions**:
1. Restart your terminal after installation
2. Verify Node.js is in your PATH
3. Try reinstalling Node.js

### Wrong Node.js Version

**Symptom**: `npm run build` fails with syntax errors

**Solutions**:
1. Check version: `node --version`
2. If version is below 20.0.0, upgrade Node.js
3. If using nvm: `nvm install 20 && nvm use 20`

### Permission Errors on Linux/macOS

**Symptom**: `EACCES: permission denied` when installing globally

**Solutions**:
1. Don't use `sudo` for npm installs
2. Fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors
3. Use nvm to manage Node.js (avoids permission issues)

---

## Next Steps

Once you have all prerequisites installed:

➡️ Continue to [Installation](./INSTALLATION.md)
