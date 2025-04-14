// customParseFrontMatter.js
const path = require('path');
const fs = require('fs');

// List to track files with issues
let filesWithIssues = [];

// Exceptions list configuration
const EXCEPTIONS_FILE_PATH = path.join(process.cwd(), 'plugins/frontmatter-validation/frontmatter-exceptions.txt');
let exceptionList = [];

function loadExceptions() {
    try {
        if (!fs.existsSync(EXCEPTIONS_FILE_PATH)) {
            console.log(`Exceptions file not found at ${EXCEPTIONS_FILE_PATH}. No exceptions will be applied.`);
            return [];
        }

        const fileContent = fs.readFileSync(EXCEPTIONS_FILE_PATH, 'utf8');
        const exceptions = [];

        fileContent.split('\n').forEach(line => {
            line = line.trim();

            // Skip empty lines and comments
            if (!line || line.startsWith('#')) {
                return;
            }

            // Check if line is a regex pattern (enclosed in slashes)
            const regexMatch = line.match(/^\/(.+)\/$/);
            if (regexMatch) {
                try {
                    exceptions.push(new RegExp(regexMatch[1]));
                } catch (e) {
                    console.warn(`Invalid regex in exceptions file: ${line}`);
                }
            } else {
                // Treat as a literal file path
                exceptions.push(line);
            }
        });

        console.log(`Loaded ${exceptions.length} frontmatter exception(s)`);
        return exceptions;
    } catch (error) {
        console.error(`Error loading exception file: ${error.message}`);
        return [];
    }
}

// Initialize exception list when module is loaded
exceptionList = loadExceptions();

/**
 * Checks if a file path should be excluded from validation
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if the file should be excluded
 */
function isExcluded(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);

    return exceptionList.some(exception => {
        if (exception instanceof RegExp) {
            return exception.test(relativePath);
        }
        return relativePath === exception;
    });
}

function reloadExceptions() {
    exceptionList = loadExceptions();
    return exceptionList.length;
}

/**
 * Custom frontmatter parser that enforces specific formatting rules
 * with support for multi-line values
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

    // Skip files in the exception list
    if (isExcluded(filePath)) {
        return await defaultParseFrontMatter(params);
    }

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

        // Check if the line after frontmatter and newline is empty or has space
        if (posAfterFrontmatter + 1 < fileContent.length) {
            const nextChar = fileContent[posAfterFrontmatter + 1];
            const nextLine = fileContent.substring(posAfterFrontmatter + 1).split('\n')[0];

            // Check for problematic content after frontmatter
            if (nextLine.startsWith('```')) {
                issues.push('backticks (```) immediately after frontmatter without space');
            } else if (nextLine !== '' && !nextLine.startsWith(' ') && !nextLine.startsWith('\t')) {
                issues.push('missing space or empty line after frontmatter');
            }
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

            // Track multi-line values
            let inMultiLineValue = false;
            let currentFieldName = '';

            for (let i = 0; i < yamlLines.length; i++) {
                const line = yamlLines[i];
                if (line.trim() === '') continue;

                // Check if this line starts a new field
                const fieldMatch = line.match(/^([a-zA-Z_]+):/);

                if (fieldMatch) {
                    // This is a new field, not a continuation
                    inMultiLineValue = false;
                    currentFieldName = fieldMatch[1];

                    // Check for single space between key and value
                    if (!/^[a-zA-Z_]+: /.test(line) && !line.includes(': [')) {
                        issues.push(`incorrect spacing in line: "${line.trim()}"`);
                    }

                    // Check for block style arrays (should be flow style with brackets)
                    if (line.trim().match(/^[a-zA-Z_]+: ?$/)) {
                        // This field has no value on the same line, check if next line starts with a dash
                        const nextLine = (i + 1 < yamlLines.length) ? yamlLines[i + 1].trim() : '';
                        if (nextLine.startsWith('-')) {
                            issues.push(`field '${currentFieldName}' should use flow style array with square brackets`);
                        }
                    }

                    // Check for single quotes on regular single-line values
                    const fieldValue = line.substring(line.indexOf(':') + 1).trim();

                    // Check if this might be the start of a multi-line value
                    if (fieldValue.startsWith("'") && !fieldValue.endsWith("'")) {
                        inMultiLineValue = true;
                        continue;
                    }

                    // Special check for keywords array - items should be in single quotes
                    if (currentFieldName === 'keywords' && line.includes('[')) {
                        // Check if this is the start of a multi-line array
                        if (line.includes('[') && !line.includes(']')) {
                            // This is the start of a multi-line array
                            inMultiLineValue = true;
                            continue;
                        }

                        // For single-line arrays
                        if (line.includes('[') && line.includes(']')) {
                            const arrayContent = line.substring(line.indexOf('[') + 1, line.lastIndexOf(']'));
                            if (arrayContent.trim()) { // Only check if array is not empty
                                const items = arrayContent.split(',').map(item => item.trim());
                                for (const item of items) {
                                    // Check if the item is not wrapped in single quotes
                                    if (item && (!item.startsWith("'") || !item.endsWith("'"))) {
                                        issues.push(`keywords array item '${item}' should be wrapped in single quotes`);
                                    }
                                }
                            }
                        }
                    }

                    const isExcludedField = currentFieldName === 'slug' ||
                        currentFieldName === 'id' ||
                        currentFieldName === 'pagination_next' ||
                        currentFieldName === 'pagination_prev';

                    if (!isExcludedField && !inMultiLineValue && (
                        line.includes(': "') || (
                            line.includes(': ') &&
                            !line.includes(': \'') &&
                            !line.includes(': [') &&
                            !line.includes(': {') &&
                            !line.includes(': true') &&
                            !line.includes(': false') &&
                            !/: \d+/.test(line)
                        )
                    )) {
                        issues.push(`value should use single quotes in line: "${line.trim()}"`);
                    }
                } else if (inMultiLineValue) {
                    // This is a continuation of a multi-line value

                    // For multi-line arrays (keywords)
                    if (currentFieldName === 'keywords') {
                        // Check individual array items if this is a line in a multi-line array
                        const trimmedLine = line.trim();

                        // Handle closing bracket properly
                        if (trimmedLine === ']') {
                            inMultiLineValue = false;
                            continue;
                        }

                        // Parse items carefully to handle the closing bracket
                        let items = [];
                        let currentItem = '';
                        let inQuotes = false;

                        for (let j = 0; j < trimmedLine.length; j++) {
                            const char = trimmedLine[j];

                            if (char === "'" && (j === 0 || trimmedLine[j-1] !== '\\')) {
                                inQuotes = !inQuotes;
                                currentItem += char;
                            } else if (char === ',' && !inQuotes) {
                                items.push(currentItem.trim());
                                currentItem = '';
                            } else if (char === ']' && !inQuotes) {
                                // End of array - don't include the closing bracket in the item
                                if (currentItem.trim()) {
                                    items.push(currentItem.trim());
                                }
                                inMultiLineValue = false;
                                break;
                            } else {
                                currentItem += char;
                            }
                        }

                        // Add the last item if we didn't end with a bracket
                        if (currentItem.trim() && !trimmedLine.endsWith(']')) {
                            items.push(currentItem.trim());
                        }

                        // Check items for proper quoting
                        for (const item of items) {
                            if (item && item !== ']') {
                                if (!item.startsWith("'") || !item.endsWith("'")) {
                                    issues.push(`keywords array item '${item}' should be wrapped in single quotes`);
                                }
                            }
                        }

                        // Array end is now handled in the item parsing loop above
                    }
                    // For regular multi-line strings
                    else if (line.trim().endsWith("'")) {
                        inMultiLineValue = false;
                    }
                } else {
                    // This is not a new field nor a continuation of a multi-line value

                    // Check for block style array items that should be flow style
                    if (line.trim().startsWith('-')) {
                        // Find the previous field to associate with this block array item
                        let j = i - 1;
                        while (j >= 0) {
                            const prevLine = yamlLines[j].trim();
                            if (prevLine.match(/^[a-zA-Z_]+: ?$/)) {
                                const fieldName = prevLine.split(':')[0].trim();
                                // Only report once per field to avoid multiple errors
                                if (!issues.some(issue => issue.includes(`field '${fieldName}'`) && issue.includes('flow style array'))) {
                                    issues.push(`field '${fieldName}' should use flow style array with square brackets`);
                                }
                                break;
                            } else if (prevLine.match(/^[a-zA-Z_]+:/)) {
                                // Found a different field, so stop looking
                                break;
                            }
                            j--;
                        }
                    }
                }
            }
        }

        // If there are issues, add to the tracking list
        if (issues.length > 0) {
            // Check if we already have an entry for this file path
            const existingIndex = filesWithIssues.findIndex(item => item.filePath === relativePath);
            if (existingIndex !== -1) {
                // Update existing entry instead of adding a duplicate
                filesWithIssues[existingIndex].issues = issues;
            } else {
                // Add new entry
                filesWithIssues.push({
                    filePath: relativePath,
                    issues
                });
            }
        }

        return parsedData;
    } catch (error) {
        console.error(`Error parsing frontmatter in ${relativePath}:`, error);

        // Check if we already have an entry for this file path
        const existingIndex = filesWithIssues.findIndex(item => item.filePath === relativePath);
        if (existingIndex !== -1) {
            // Update existing entry instead of adding a duplicate
            filesWithIssues[existingIndex].issues = [`parsing error: ${error.message}`];
        } else {
            // Add new entry
            filesWithIssues.push({
                filePath: relativePath,
                issues: [`parsing error: ${error.message}`]
            });
        }

        return await defaultParseFrontMatter(params);
    }
}

// Export the function and the issue tracker for use in the build plugin
module.exports = {
    customParseFrontMatter,
    getFilesWithIssues: () => [...filesWithIssues], // Return a copy to prevent external modifications
    resetIssues: () => {
        filesWithIssues = []; // Replace the array instead of modifying it
    },
    // Export exception list management functions
    reloadExceptions,
    getExceptions: () => [...exceptionList]
};
