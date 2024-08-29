const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const projectRoot = path.join(__dirname, '..', '..');
const contentDir = path.join(projectRoot, 'docs');

function getAllDocsFromContent() {
  let allDocs = {};

  function readDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        readDirectory(fullPath); // Recurse into subdirectories
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Remove the contentDir prefix and the .md extension to get the relative path
        const relativePath = fullPath.replace(contentDir, '').replace(/\.md$/, '');
        const normalizedPath = relativePath.replace(/\\/g, '/'); // Normalize slashes for cross-platform

        if (
          normalizedPath.startsWith('/en/_placeholders/') ||
          normalizedPath.startsWith('/en/_snippets/') ||
          normalizedPath.startsWith('/_clients/')
        ) {
          return;
        }

        allDocs[normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath] = fullPath;
      }
    });
  }

  readDirectory(contentDir);
  return allDocs;
}

function getSlugsFromFrontMatter(allDocs) {
  let slugs = {};

  Object.keys(allDocs).forEach(relativePath => {
    const filePath = allDocs[relativePath];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);

      if (data.slug) {
        slugs[relativePath] = data.slug; // Assign the slug from the front matter if it exists
      }
    } catch (error) {
      console.error(`Error reading front matter of file: ${filePath}`, error);
    }
  });

  return slugs;
}

function mapPathsToSlugs() {
  const docsFromContent = getAllDocsFromContent();
  const slugsFromFrontMatter = getSlugsFromFrontMatter(docsFromContent);

  let mappedLinks = {};

  Object.keys(docsFromContent).forEach(relativePath => {
    mappedLinks[relativePath] = slugsFromFrontMatter[relativePath] || relativePath;
  });

  return mappedLinks;
}

function writeLinksToFile(links) {
  const outputPath = path.join(projectRoot, 'active_links.json');
  fs.writeFileSync(outputPath, JSON.stringify(links, null, 2), 'utf8');
  console.log(`Links have been written to ${outputPath}`);
}

// Main execution
const mappedLinks = mapPathsToSlugs();
writeLinksToFile(mappedLinks);
