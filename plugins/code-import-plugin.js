const fs = require('fs');
const path = require('path');
const glob = require('glob');
const https = require('https');
const http = require('http');

// Helper function to fetch content from URL
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

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
          
          // Process code blocks with file= or url= syntax
          const fileUrlRegex = /```(\w+)?\s*((?:file|url)=[^\s\n]+)([^\n]*)\n([^`]*?)```/g;
          const matches = [...content.matchAll(fileUrlRegex)];
          
          for (const match of matches) {
            const [fullMatch, lang, param, additionalMeta, existingContent] = match;
            
            try {
              let importedContent;
              
              if (param.startsWith('file=')) {
                // Handle file import
                const importPath = param.replace('file=', '');
                const absoluteImportPath = path.resolve(context.siteDir, importPath);
                importedContent = fs.readFileSync(absoluteImportPath, 'utf8');
              } else if (param.startsWith('url=')) {
                // Handle URL import
                const url = param.replace('url=', '');
                try {
                  importedContent = await fetchUrl(url);
                } catch (urlError) {
                  console.warn(`Could not fetch URL ${url} in ${filePath}: ${urlError.message}`);
                  continue; // Skip this replacement if URL fetch fails
                }
              }
              
              // Preserve the complete metadata
              const fullMeta = `${param}${additionalMeta}`;
              const metaStr = fullMeta ? ` ${fullMeta}` : '';
              const replacement = `\`\`\`${lang || ''}${metaStr}\n${importedContent}\`\`\``;
              
              content = content.replace(fullMatch, replacement);
              modified = true;
              
            } catch (error) {
              console.warn(`Could not process ${param} in ${filePath}: ${error.message}`);
            }
          }
          
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