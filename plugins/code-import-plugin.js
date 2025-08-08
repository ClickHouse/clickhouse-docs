const fs = require('fs');
const path = require('path');
const glob = require('glob');

function codeImportPlugin(context, options) {
  return {
    name: 'code-import-plugin',
    async loadContent() {
      // Find all markdown files in docs directory that might contain code imports
      const docsPath = path.join(context.siteDir, 'docs');
      
      const markdownFiles = [
        ...glob.sync('**/*.md', { cwd: docsPath, absolute: true }),
        ...glob.sync('**/*.mdx', { cwd: docsPath, absolute: true }),
      ];

      // Process each markdown file for code imports
      const processedFiles = [];
      
      for (const filePath of markdownFiles) {
        try {
          let content = fs.readFileSync(filePath, 'utf8');
          let modified = false;
          
          // Process code blocks with file= syntax
          content = content.replace(/```(\w+)?\s*(file=[^\s\n]+)([^\n]*)\n([^`]*?)```/g, (match, lang, fileParam, additionalMeta, existingContent) => {
            try {
              const importPath = fileParam.replace('file=', '');
              const absoluteImportPath = path.resolve(context.siteDir, importPath);
              const importedContent = fs.readFileSync(absoluteImportPath, 'utf8');
              modified = true;
              
              // Preserve the complete metadata including file= and any additional parameters
              const fullMeta = `${fileParam}${additionalMeta}`;
              const metaStr = fullMeta ? ` ${fullMeta}` : '';
              
              return `\`\`\`${lang || ''}${metaStr}\n${importedContent}\`\`\``;
            } catch (error) {
              console.warn(`Could not import file ${importPath} in ${filePath}: ${error.message}`);
              return match; // Return original if import fails
            }
          });
          
          if (modified) {
            processedFiles.push({
              path: filePath,
              content: content,
              originalPath: filePath
            });
          }
        } catch (error) {
          console.warn(`Error processing file ${filePath}: ${error.message}`);
        }
      }
      
      return { processedFiles };
    },
    
    async contentLoaded({ content, actions }) {
      const { processedFiles } = content;
      
      // Write processed files back to disk during build
      for (const file of processedFiles) {
        try {
          fs.writeFileSync(file.path, file.content, 'utf8');
          console.log(`Processed code imports in: ${path.relative(context.siteDir, file.path)}`);
        } catch (error) {
          console.error(`Error writing processed file ${file.path}: ${error.message}`);
        }
      }
    }
  };
}

module.exports = codeImportPlugin;