# Astro/Starlight CMS Customizations

This document explains the custom modifications made to the Astro/Starlight setup for the Strands Agents documentation site.

## Overview

We're using [Astro](https://astro.build/) with the [Starlight](https://starlight.astro.build/) documentation theme. However, we've made several customizations to preserve compatibility with our existing MkDocs-based documentation structure and navigation.

## Key Customizations

### 1. Sidebar Generation (`src/sidebar.ts`)

**What it does:** Reads the navigation structure from `mkdocs.yml` and converts it to Starlight's sidebar format.

**Why:** Starlight can auto-generate sidebars from the file structure, but we have a specific navigation layout defined in `mkdocs.yml` that we want to preserve. This ensures consistency during the migration from MkDocs to Astro.

### 2. Route Middleware (`src/route-middleware.ts`)

**What it does:** Filters the sidebar at buildtime so each page only shows items from its top-level group.

**Why:** Our sidebar is organized into top-level groups (User Guide, Community, Examples, etc.). Without this middleware, every page would show the entire sidebar. This middleware scopes the sidebar to the current section, providing a cleaner navigation experience.

### 3. MkDocs Snippets Plugin (`src/plugins/remark-mkdocs-snippets.ts`)

**What it does:** Processes MkDocs-style code snippet references in markdown files.

**Why:** Our existing documentation uses MkDocs' snippet syntax to include code from external files. This plugin provides compatibility so we don't need to rewrite all our code examples.

**Syntax supported:**
```markdown
```typescript
--8<-- "path/to/file.ts:section_name"
```
```

**Source file markers:**
```typescript
// --8<-- [start:section_name]
const example = "This code will be included"
// --8<-- [end:section_name]
```

## Configuration (`astro.config.mjs`)

The main config ties everything together:

```javascript
import { loadSidebarFromMkdocs } from "./src/sidebar.ts"
import remarkMkdocsSnippets from './src/plugins/remark-mkdocs-snippets.ts'

const sidebar = loadSidebarFromMkdocs(
  path.resolve('./mkdocs.yml'),
  path.resolve('./src/content/docs')
)

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkMkdocsSnippets],
  },
  integrations: [starlight({
    sidebar: sidebar,
    routeMiddleware: './src/route-middleware.ts',
    // ...
  })],
})
```

## Temporary Migration Script (`scripts/update-docs.ts`)

**What it does:** Converts documentation files from MkDocs markdown format to Astro/Starlight markdown format.

**Why:** MkDocs and Astro use different markdown conventions. Rather than updating Astro's parser to support MkDocs syntax, we convert files to what Astro expects. This runs at build time because the main branch (still in MkDocs format) is a moving target until migration is complete.

**Current approach:** Source control keeps files in MkDocs format. The script runs at build time to transform them. Once migration is complete, we'll do a final conversion, remove the script, and commit the transformed files directly.

For detailed information about what transformations the script performs (and what's planned), see [`scripts/update-docs.md`](scripts/update-docs.md).