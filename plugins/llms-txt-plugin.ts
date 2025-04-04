import * as path from "node:path";
import * as fs from "node:fs";

// Helper function to extract frontmatter from MDX content
function extractFrontmatter(mdxContent) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = mdxContent.match(frontmatterRegex);

  if (match && match[1]) {
    const frontmatterLines = match[1].split(/\r?\n/);
    const frontmatter = {};

    frontmatterLines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          // Remove quotes if present
          const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
          frontmatter[key] = cleanValue;
        }
      }
    });

    return frontmatter;
  }

  return null;
}

async function pluginLlmsTxt(context) {
  return {
    name: "llms-txt-plugin",
    loadContent: async () => {
      const { siteDir } = context;
      const contentDir = path.join(siteDir, "docs");

      // Store all slugs from MDX files
      const slugs = new Map();

      // Function to collect slugs from all MDX files
      const collectSlugs = async (dir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await collectSlugs(fullPath);
          } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            try {
              const content = await fs.promises.readFile(fullPath, 'utf8');
              const frontmatter = extractFrontmatter(content);

              if (frontmatter && frontmatter.slug) {
                // Store the file content by its slug
                slugs.set(frontmatter.slug, {
                  slug: frontmatter.slug,
                  title: frontmatter.title || '',
                  description: frontmatter.description || ''
                });
              }
            } catch (error) {
              console.error(`Error processing file ${fullPath}:`, error);
            }
          }
        }
      };

      await collectSlugs(contentDir);
      return { slugs };
    },

    postBuild: async ({ content, routes, outDir }) => {
      const { slugs } = content;

      // We need to find the docs route config
      const docsPluginRouteConfig = routes.find(
          route => route.plugin?.name === "docusaurus-plugin-content-docs"
      );

      if (!docsPluginRouteConfig || !docsPluginRouteConfig.routes || !docsPluginRouteConfig.routes[0]?.props?.version) {
        console.warn("Could not find docs plugin route configuration");
        return;
      }

      // Get the docs from the route config
      const currentVersionDocsRoutes = (
          docsPluginRouteConfig.routes[0].props.version
      ).docs;

      // Simply use all the slugs we found
      const docsRecords = Array.from(slugs.values()).map(info => {
        const normalizedSlug = info.slug.startsWith('/') ? info.slug : `/${info.slug}`;
        return `- [${info.title || normalizedSlug}](https://clickhouse.com/docs${normalizedSlug}): ${info.description || ''}`;
      });

      console.log(`Found ${slugs.size} documents with slugs`);

      // Build up llms.txt file
      let llmsTxt = `# ${context.siteConfig.title}\n\n`;
      llmsTxt += '> Documentation for ClickHouse, the fastest and most resource' +
          ' efficient real-time data warehouse and open-source database.\n' +
          'Including documentation for opensource ClickHouse, ClickHouse Cloud,' +
          ' chDB and various integrations for ClickHouse.\n The documentation has ' +
          'various resources for learning ClickHouse as well as reference documentation\n\n';
      llmsTxt += `## Docs\n\n${docsRecords.join("\n")}`;

      // Write llms.txt file
      try {
        fs.writeFileSync(path.join(outDir, "llms.txt"), llmsTxt);
        console.log(`Successfully generated llms.txt with ${docsRecords.length} document records`);
      } catch (err) {
        console.error("Error writing file:", err);
        throw err;
      }
    }
  };
}

export default pluginLlmsTxt;
