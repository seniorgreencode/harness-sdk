# CMS Migration TODO

- [ ] Move asset files to proper location (currently in `docs/assets/`, should be in `src/content/docs/assets/`)
- [ ] Remove symlink at `src/content/docs` → `../../docs` and move content to actual location
- [ ] Inline TypeScript code examples directly in markdown and verify via separate type-checking step (e.g., `tsc` on extracted code blocks) instead of snippet includes
- [ ] Remove Vite SSR workaround for zod in `astro.config.mjs` once CMS build is separated from TS verification (see https://github.com/withastro/astro/issues/14117)
- [ ] Fix relative links to pages (e.g., `../some-page.md` style links need to be converted to Starlight-compatible paths)
- [ ] Add API documentation generation/integration for Python and TypeScript SDKs
