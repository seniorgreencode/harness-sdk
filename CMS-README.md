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

## Custom Frontmatter Fields

The documentation extends Starlight's default schema with custom fields that automatically render contextual banners at the top of pages.

### `languages`

Indicates a feature is only available in specific SDK languages.

```yaml
---
title: My Feature
languages: Python
---
```

Renders a note aside: "This provider is only supported in {languages}."

### `community`

Marks a page as community-contributed content.

```yaml
---
title: Community Tool
community: true
---
```

Renders a tip aside explaining the package is community-maintained, not officially supported.

### `experimental`

Marks a feature as experimental.

```yaml
---
title: Experimental Feature
experimental: true
---
```

Renders a tip aside warning the feature may change in future versions.

### Rendering Order

When multiple fields are set, banners render top to bottom: experimental → community → languages.

### Sidebar Badges

Pages can display badges in sidebar navigation:

```yaml
---
title: My Page
sidebar:
  badge:
    text: Community
    variant: note
---
```

Available variants: `note`, `tip`, `caution`, `danger`, `success`, `default`

## MDX Components

Documentation pages use MDX format and can import [Starlight components](https://starlight.astro.build/components/using-components/):

```mdx
import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs>
  <TabItem label="Python">Python code here</TabItem>
  <TabItem label="TypeScript">TypeScript code here</TabItem>
</Tabs>
```

Available: `Tabs`/`TabItem`, `Aside`, `Card`/`CardGrid`, `LinkCard`, `Icon`, `Badge`

### Auto-Imported Components

We use [astro-auto-import](https://github.com/delucis/astro-auto-import) to make `Tabs` and `Tab` available globally without explicit imports. Since language tabs appear on nearly every page, this reduces boilerplate.

```mdx
<!-- No import needed — just use directly -->
<Tabs>
  <Tab label="Python">pip install strands</Tab>
  <Tab label="TypeScript">npm install @strands-agents/sdk</Tab>
</Tabs>
```

`Tabs` maps to our `AutoSyncTabs` component (auto-syncs tabs with matching labels), and `Tab` maps to Starlight's `TabItem`.

For other components, use [explicit imports](https://starlight.astro.build/components/using-components/).

## Custom Components (`src/components/`)

### `AutoSyncTabs`

A wrapper around Starlight's `Tabs` that auto-generates a `syncKey` from tab labels. Tabs with identical label sets automatically sync together across the page. Auto-imported as `Tabs` (see above).

### Starlight Overrides (`src/components/overrides/`)

These override default Starlight components:

- **`Head.astro`**: Adds Mermaid diagram support by transforming code blocks with `language="mermaid"` into rendered diagrams.
- **`MarkdownContent.astro`**: Injects the custom frontmatter banners (experimental, community, languages) at the top of page content.

### Internal Aside Components

Used by `MarkdownContent.astro` to render frontmatter banners:

- `ExperimentalAside.astro`
- `CommunityContributionAside.astro`
- `LanguageSupportAside.astro`

These are not meant to be imported directly in MDX files—use the frontmatter fields instead.