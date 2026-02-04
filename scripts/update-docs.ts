import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import yaml from "js-yaml";

const DOCS_DIR = "src/content/docs";

// Files that need explicit titles because they don't have H1 headings
const EXPLICIT_TITLES: Record<string, string> = {
  "user-guide/quickstart.md": "Quickstart",
  "user-guide/quickstart/python.md": "Python Quickstart",
  "user-guide/concepts/model-providers/clova-studio.md": "Clova Studio",
  "user-guide/concepts/model-providers/cohere.md": "Cohere",
  "user-guide/concepts/model-providers/fireworksai.md": "Fireworks AI",
  "user-guide/concepts/model-providers/nebius-token-factory.md": "Nebius Token Factory",
};

interface DocFile {
  frontmatter: Record<string, unknown>;
  content: string;
  modified: boolean;
}

/**
 * Parse a markdown file into frontmatter and content
 */
function parseFile(raw: string): DocFile {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?/;
  const match = raw.match(frontmatterRegex);

  if (match) {
    const frontmatterStr = match[1];
    const content = raw.slice(match[0].length);
    const frontmatter = (yaml.load(frontmatterStr) as Record<string, unknown>) ?? {};
    return { frontmatter, content, modified: false };
  }

  return { frontmatter: {}, content: raw, modified: false };
}

/**
 * Serialize frontmatter and content back to a markdown string
 */
function serializeFile(frontmatter: Record<string, unknown>, content: string): string {
  const hasContent = Object.keys(frontmatter).length > 0;
  if (!hasContent) {
    return content;
  }

  const frontmatterStr = yaml.dump(frontmatter, { lineWidth: -1 }).trim();
  return `---\n${frontmatterStr}\n---\n\n${content}`;
}

/**
 * Extract the first H1 heading from content
 */
function extractH1Title(content: string): string | null {
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (!inCodeBlock) {
      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match) {
        return h1Match[1].trim();
      }
    }
  }

  return null;
}

/**
 * Remove the first H1 heading from content
 */
function removeH1Heading(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let inCodeBlock = false;
  let removedH1 = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (!inCodeBlock && !removedH1 && line.match(/^#\s+.+$/)) {
      removedH1 = true;
      // Skip blank line after H1 if present
      if (i + 1 < lines.length && lines[i + 1].trim() === "") {
        i++;
      }
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

interface FileContext {
  relativePath: string;
}

/**
 * Update title in frontmatter from H1 heading or explicit title
 */
function updateTitleIfNecessary(doc: DocFile, ctx: FileContext): void {
  const h1Title = extractH1Title(doc.content);
  const explicitTitle = EXPLICIT_TITLES[ctx.relativePath];
  const titleToUse = explicitTitle ?? h1Title;

  // Add title to frontmatter if not present
  if (titleToUse && !doc.frontmatter.title) {
    doc.frontmatter = { title: titleToUse, ...doc.frontmatter };
    doc.modified = true;
  }

  // Remove H1 heading from content (title is in frontmatter)
  if (h1Title) {
    doc.content = removeH1Heading(doc.content);
    doc.modified = true;
  }
}

/**
 * Process a parsed file and apply modifications
 */
function processFile(doc: DocFile, ctx: FileContext): void {
  updateTitleIfNecessary(doc, ctx);

  // Add more modifications here as needed
}

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.name.endsWith(".md")) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function main() {
  console.log(`Scanning ${DOCS_DIR} for markdown files...`);

  const files = await getAllMarkdownFiles(DOCS_DIR);
  let processedCount = 0;

  for (const file of files) {
    const raw = await readFile(file, "utf-8");
    const relativePath = file.replace(`${DOCS_DIR}/`, "");

    // Parse
    const doc = parseFile(raw);

    // Process
    const ctx: FileContext = { relativePath };
    processFile(doc, ctx);

    // Write if modified
    if (doc.modified) {
      const output = serializeFile(doc.frontmatter, doc.content);
      await writeFile(file, output, "utf-8");
      console.log(`✓ Updated: ${file}`);
      processedCount++;
    }
  }

  console.log(`\nDone! Updated ${processedCount} file(s).`);
}

main().catch(console.error);
