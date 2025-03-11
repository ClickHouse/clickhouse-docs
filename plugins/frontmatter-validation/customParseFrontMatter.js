// customParseFrontMatter.js
const path = require('path');

// List to track files with issues
const filesWithIssues = [];

/**
 * Custom frontmatter parser that enforces specific formatting rules
 *
 * @param {Object} params - The parameters provided by Docusaurus
 * @param {string} params.filePath - Path to the markdown file
 * @param {string} params.fileContent - Content of the markdown file
 * @param {Function} params.defaultParseFrontMatter - Docusaurus's default frontmatter parser
 * @returns {Promise<Object>} - The parsed frontmatter
 */
async function customParseFrontMatter(params) {
    const { filePath, fileContent, defaultParseFrontMatter } = params;
    const relativePath = path.relative(process.cwd(), filePath);
    const issues = [];

    // Skip snippets
    const regex_snippets = /snippet(s)?/i;
    if (regex_snippets.test(filePath)) {
        return await defaultParseFrontMatter(params);
    }

    // Skip knowledgebase articles
    const regex_kb = /knowledgebase?/i;
    if (regex_kb.test(filePath)) {
        return await defaultParseFrontMatter(params);
    }

    // Skip non-markdown files
    if (!filePath.endsWith('.md') && !filePath.endsWith('.mdx')) {
        return await defaultParseFrontMatter(params);
    }

    // Check for preceding whitespace before frontmatter
    if (fileContent.startsWith(' ') || fileContent.startsWith('\t')) {
        issues.push('has preceding whitespace before frontmatter');
    }

    // Check for newline after last ---
    const frontmatterMatch = fileContent.match(/---\s*\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
        const posAfterFrontmatter = fileContent.indexOf('---', frontmatterMatch.index + 3) + 3;
        if (posAfterFrontmatter < fileContent.length && fileContent[posAfterFrontmatter] !== '\n') {
            issues.push('missing newline after frontmatter closing ---');
        }
    }

    try {
        // Use Docusaurus's default parser to get the frontmatter data
        const parsedData = await defaultParseFrontMatter(params);
        // Check for required fields
        const requiredFields = ['title', 'slug', 'description'];
        for (const field of requiredFields) {
            if (!parsedData.frontMatter[field]) {
                issues.push(`missing required field: ${field}`);
            }
        }

        // Check optional fields format
        if (parsedData.frontMatter["keywords"] && !Array.isArray(parsedData.frontMatter["keywords"])) {
            issues.push('keywords must be a list');
        }

        // Check the original YAML format for single quotes and spacing
        if (frontmatterMatch) {
            const yamlContent = frontmatterMatch[1];
            const yamlLines = yamlContent.split('\n');

            for (const line of yamlLines) {
                if (line.trim() === '') continue;

                // Check for single space between key and value
                if (!/^[a-zA-Z_]+: /.test(line) && !line.includes(': [')) {
                    issues.push(`incorrect spacing in line: "${line.trim()}"`);
                }

                // Special check for keywords array - items should be in single quotes
                if (line.trim().startsWith('keywords:') && line.includes('[')) {
                    const arrayContent = line.substring(line.indexOf('[') + 1, line.lastIndexOf(']'));
                    if (arrayContent.trim()) { // Only check if array is not empty
                        const items = arrayContent.split(',').map(item => item.trim());
                        for (const item of items) {
                            // Check if the item is not wrapped in single quotes
                            if (item && !item.startsWith("'") || !item.endsWith("'")) {
                                issues.push(`keywords array item '${item}' should be wrapped in single quotes`);
                            }
                        }
                    }
                }

                const lineStart = line.trim();
                const isExcludedField = lineStart.startsWith('slug:') || lineStart.startsWith('id:');
                if (!isExcludedField && (
                    line.includes(': "') || (line.includes(': ') &&
                        !line.includes(': \'') &&
                        !line.includes(': [') &&
                        !line.includes(': {') &&
                        !line.includes(': true') &&
                        !line.includes(': false') &&
                        !/: \d+/.test(line)))) {
                    issues.push(`value should use single quotes in line: "${line.trim()}"`);
                }
            }
        }

        // If there are issues, add to the tracking list
        if (issues.length > 0) {
            filesWithIssues.push({
                filePath: relativePath,
                issues
            });
        }

        return parsedData;
    } catch (error) {
        console.error(`Error parsing frontmatter in ${relativePath}:`, error);
        filesWithIssues.push({
            filePath: relativePath,
            issues: [`parsing error: ${error.message}`]
        });
        return await defaultParseFrontMatter(params);
    }
}

// Export the function and the issue tracker for use in the build plugin
module.exports = {
    customParseFrontMatter,
    getFilesWithIssues: () => filesWithIssues,
    resetIssues: () => {
        filesWithIssues.length = 0;
    }
};