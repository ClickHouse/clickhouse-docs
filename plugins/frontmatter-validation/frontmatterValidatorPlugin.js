const path = require('path');
const fs = require('fs');
const { getFilesWithIssues, resetIssues, reloadExceptions } = require('./customParseFrontMatter');

/**
 * Custom plugin to enforce frontmatter formatting rules
 * and fail the build if any issues are found
 */
function frontmatterValidatorPlugin(context, options) {
    return {
        name: 'frontmatter-validator-plugin',

        // Reset the issue tracker at the beginning of each build
        async loadContent() {
            reloadExceptions();
            resetIssues();
        },

        // Check for issues
        async postBuild({ outDir }) {
            const filesWithIssues = getFilesWithIssues();
            
            if (filesWithIssues.length > 0) {
                if (options && options.failBuild) {
                    console.error('\n🚨 Build failed: Frontmatter validation issues found');
                    console.error('The following files have frontmatter issues:');

                    filesWithIssues.forEach(({ filePath, issues }) => {
                        console.error(`\n📄 ${filePath}:`);
                        issues.forEach(issue => {
                            console.error(`  • ${issue}`);
                        });
                    });

                    // Write the results to a log file for easier review
                    const logContent = filesWithIssues
                        .map(({ filePath, issues }) =>
                            `${filePath}:\n${issues.map(issue => `  • ${issue}`).join('\n')}`)
                        .join('\n\n');

                    fs.writeFileSync(
                        path.join(process.cwd(), 'frontmatter-validation-errors.log'),
                        logContent
                    );
                    console.log('See frontmatter-validation-errors.log (when running locally)')

                    // Fail the build by throwing an error
                    console.error('🚨Frontmatter validation failed. For more details see https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/style-guide.md');
                    // Create a signal file
                    fs.writeFileSync(
                        path.join(process.cwd(), '.frontmatter-validation-failed'),
                        'Frontmatter validation failed'
                    );
                    process.exit(1);
                } else {
                    console.log(`⚠️ Warning: Found ${filesWithIssues.length} files containing problems with frontmatter`)
                }

            } else {
                console.log('✅ All markdown files passed frontmatter validation.');
            }
        }
    };
}

module.exports = frontmatterValidatorPlugin;
