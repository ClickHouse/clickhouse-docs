const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');

/**
 * Recursively find all .md and .mdx files in a directory
 */
function findMarkdownFiles(dir) {
    const files = [];

    function scanDirectory(currentDir) {
        try {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);

                if (entry.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
                    files.push(fullPath);
                }
            }
        } catch (err) {
            // Skip directories that can't be read
        }
    }

    scanDirectory(dir);
    return files;
}

/**
 * Plugin to extract integration data and generate static JSON file
 */
function integrationExtractorPlugin(context, options) {
    return {
        name: 'integration-extractor-plugin',

        async loadContent() {
            const integrationsDir = path.join(context.siteDir, 'docs/integrations');

            // Find all markdown files in the docs/integrations directory
            const integrationFiles = findMarkdownFiles(integrationsDir);
            const integrations = [];

            integrationFiles.forEach(fullPath => {
                try {
                    const fileContent = fs.readFileSync(fullPath, 'utf8');
                    const { data: frontmatter } = matter(fileContent);

                    // Only include files that have both integration_type and integration_logo
                    if (frontmatter.integration_type && frontmatter.integration_logo) {
                        // Fix logo path for Docusaurus static serving
                        let logoPath = frontmatter.integration_logo;
                        if (logoPath.startsWith('/static/')) {
                            logoPath = logoPath.replace('/static/', '/');
                        }

                        integrations.push({
                            slug: frontmatter.slug,
                            integration_logo: logoPath,
                            integration_type: Array.isArray(frontmatter.integration_type)
                                ? frontmatter.integration_type
                                : [frontmatter.integration_type],
                            integration_title: frontmatter.integration_title,
                            integration_tier: frontmatter.integration_tier
                        });
                    }
                } catch (err) {
                    console.warn(`Warning: Could not process file ${fullPath}:`, err.message);
                }
            });

            // Sort integrations alphabetically by integration_title, fallback to slug
            integrations.sort((a, b) => {
                const titleA = a.integration_title || a.slug;
                const titleB = b.integration_title || b.slug;
                return titleA.localeCompare(titleB);
            });

            console.log(`✅ Integration extractor: Found ${integrations.length} total integrations`);
            return integrations;
        },

        async contentLoaded({ content, actions }) {
            // Write JSON file to static directory for easy importing
            const staticDir = path.join(context.siteDir, 'static');
            const jsonPath = path.join(staticDir, 'integrations.json');

            // Ensure static directory exists
            if (!fs.existsSync(staticDir)) {
                fs.mkdirSync(staticDir, { recursive: true });
            }

            fs.writeFileSync(jsonPath, JSON.stringify(content, null, 2));
            console.log(`✅ Integration extractor: Generated static/integrations.json`);
        },

        async postBuild({ outDir }) {
            // Log how many integrations were processed
            console.log(`✅ Integration extractor: Found and processed ${this.loadContent ? (await this.loadContent()).length : 0} integrations`);
        }
    };
}

module.exports = integrationExtractorPlugin;