const path = require('path');
const fs = require('fs');
const { getFilesWithIssues, resetIssues } = require('./customParseFrontMatter');

/**
 * Custom plugin to enforce frontmatter formatting rules
 * and fail the build if any issues are found
 */
function frontmatterValidatorPlugin() {
    return {
        name: 'frontmatter-validator-plugin',

        // Reset the issue tracker at the beginning of each build
        async loadContent() {
            resetIssues();
        },

        // Check for issues after the build
        async postBuild({ outDir }) {
            const filesWithIssues = getFilesWithIssues();

            if (filesWithIssues.length > 0) {
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
                throw new Error('Frontmatter validation failed. See frontmatter-validation-errors.log for details.');
            } else {
                console.log('✅ All markdown files passed frontmatter validation.');
            }
        }
    };
}

module.exports = frontmatterValidatorPlugin;