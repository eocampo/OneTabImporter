# Data Schema Documentation

This document describes the data formats used by the OneTab Importer.

## Schema Version

Current: `1.0.0`

## OneTab Native Format

This is how OneTab stores data internally in LevelDB/localStorage.

### State Object

```json
{
  "state": {
    "tabGroups": [
      {
        "id": "abc123-unique-id",
        "tabsMeta": [
          {
            "id": "tab-unique-id-1",
            "url": "https://example.com/page",
            "title": "Example Page Title"
          },
          {
            "id": "tab-unique-id-2",
            "url": "https://another.example.com",
            "title": "Another Page"
          }
        ],
        "createDate": 1738368000000,
        "starred": false,
        "title": "Optional Group Title"
      }
    ]
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `tabGroups` | array | Array of tab group objects |
| `tabGroups[].id` | string | Unique identifier for the group |
| `tabGroups[].tabsMeta` | array | Array of tab objects in this group |
| `tabGroups[].tabsMeta[].id` | string | Unique identifier for the tab |
| `tabGroups[].tabsMeta[].url` | string | Full URL of the page |
| `tabGroups[].tabsMeta[].title` | string | Page title |
| `tabGroups[].createDate` | number | **Unix epoch milliseconds** |
| `tabGroups[].starred` | boolean | Whether the group is starred/locked |
| `tabGroups[].title` | string | Optional custom title for the group |

### Timestamp Conversion

```javascript
// OneTab stores timestamps as Unix epoch milliseconds
const epochMs = 1738368000000;

// Convert to JavaScript Date
const date = new Date(epochMs);

// Convert to ISO 8601
const iso = date.toISOString();
// "2025-02-01T00:00:00.000Z"
```

---

## Master Data Format

This is our normalized format stored in `data/master.json`.

### Full Schema

```json
{
  "schemaVersion": "1.0.0",
  "exportedAt": "2026-02-01T10:30:00.000Z",
  "source": {
    "browser": "edge",
    "extensionId": "hoimpamkkoehapgenciaoajfkfkpgfop",
    "extractionMethod": "devtools"
  },
  "stats": {
    "totalGroups": 150,
    "totalTabs": 2500,
    "dateRange": {
      "earliest": "2023-01-15T08:30:00.000Z",
      "latest": "2026-02-01T10:03:00.000Z"
    }
  },
  "groups": [
    {
      "id": "abc123-unique-id",
      "tabs": [
        {
          "id": "tab-unique-id-1",
          "url": "https://example.com/page",
          "title": "Example Page Title",
          "domain": "example.com"
        }
      ],
      "createdAt": "2026-02-01T10:03:29.000Z",
      "createdAtEpoch": 1738404209000,
      "tabCount": 39,
      "starred": false,
      "title": "Optional Group Title"
    }
  ]
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `schemaVersion` | string | Schema version for migrations |
| `exportedAt` | string | ISO 8601 timestamp of export |
| `source.browser` | enum | `"edge"` \| `"chrome"` \| `"firefox"` \| `"unknown"` |
| `source.extensionId` | string | Browser extension ID used |
| `source.extractionMethod` | enum | `"devtools"` \| `"leveldb"` \| `"import"` |
| `stats.totalGroups` | number | Count of tab groups |
| `stats.totalTabs` | number | Total count of all tabs |
| `stats.dateRange.earliest` | string | ISO 8601 of oldest group |
| `stats.dateRange.latest` | string | ISO 8601 of newest group |
| `groups` | array | Array of normalized TabGroup objects |
| `groups[].id` | string | Original OneTab group ID |
| `groups[].tabs` | array | Array of Tab objects |
| `groups[].tabs[].id` | string | Original OneTab tab ID |
| `groups[].tabs[].url` | string | Full URL |
| `groups[].tabs[].title` | string | Page title |
| `groups[].tabs[].domain` | string | Extracted domain (hostname) |
| `groups[].createdAt` | string | **ISO 8601 timestamp** |
| `groups[].createdAtEpoch` | number | Original epoch ms (preserved) |
| `groups[].tabCount` | number | Number of tabs in group |
| `groups[].starred` | boolean | Whether group is starred |
| `groups[].title` | string? | Optional custom group title |

---

## Markdown Export Format

Generated files in `output/` directory.

### File Naming

| Group By | File Path |
|----------|-----------|
| month | `output/2026/2026-02.md` |
| week | `output/2026/2026-W05.md` |
| day | `output/2026/2026-02/2026-02-01.md` |

### File Structure

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

### Feb 1, 2026, 09:15 AM

- [GitHub](https://github.com)
- [Stack Overflow](https://stackoverflow.com)

```

### Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `period` | string | The time period (e.g., "2026-02") |
| `groupBy` | string | Grouping method used |
| `totalGroups` | number | Groups in this file |
| `totalTabs` | number | Tabs in this file |
| `generated` | string | When file was generated |

---

## Search Results Format

When using `--format json` with search.

```json
{
  "query": "github",
  "totalResults": 25,
  "results": [
    {
      "tab": {
        "id": "tab-id",
        "url": "https://github.com/user/repo",
        "title": "GitHub Repository",
        "domain": "github.com"
      },
      "group": {
        "id": "group-id",
        "createdAt": "2026-01-15T10:00:00.000Z",
        "title": null
      },
      "matches": {
        "inTitle": true,
        "inUrl": true,
        "inDomain": true
      }
    }
  ]
}
```

---

## TypeScript Interfaces

See [src/models/types.ts](../src/models/types.ts) for complete TypeScript definitions.

```typescript
// Key imports
import type {
  OneTabGroup,
  OneTabTabMeta,
  MasterData,
  TabGroup,
  Tab,
  SearchResult,
  SearchResults,
} from './models/types.js';
```
