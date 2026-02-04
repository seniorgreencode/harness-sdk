#### Markdown Conversion

`./update-docs.ts` is a script to convert from MkDocs markdown format to Astro/Starlight markdown.

**Why convert?** Markdown as a spec is very loose and everyone's markdown is different. All of the features we use in our [current CMS MkDocs](https://www.mkdocs.org/getting-started/) are not available in the new [CMS Astro](https://starlight.astro.build/). While we *could* update the Astro markdown parser to support the same features, it makes more sense to do a conversion to what Astro expects instead, allowing us to move faster and leverage more Astro features going forward.

**Why not convert everything now?** Until we fully migrate to the new CMS, the main branch is a moving target. Converting all files upfront would mean we'd lose changes being made on main, or we'd need to continuously re-sync and re-convert as updates come in. Instead, we run the conversion as part of the build process.

**Current approach:** Source control keeps files in MkDocs format. The conversion script runs at build time to transform them for Astro. Once we complete the migration to the new CMS, we'll do a final conversion, remove the script, and commit the transformed files directly to source.

#### What Needs to Be Converted

The full migration will require these conversions:

- **MkDocs variables** (`{{ var }}`) → Replace with actual values
- **MkDocs admonitions** (`!!! type`) → Astro asides (`:::type`)
- **MkDocs tabs** (`=== "Label"`) → `<Tabs>`/`<TabItem>` components
- **HTML comments** (`<!-- -->`) → JSX comments (`{/* */}`) for MDX compatibility
- **File extensions** (`.md`) → Rename to `.mdx`
- **Frontmatter** → Astro requires `title` frontmatter in all content files

#### What We Convert Today

Currently, the conversion script only handles:

- Adding `title` frontmatter (extracted from the first heading or filename)
