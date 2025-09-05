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

// Helper function to extract snippet from content using comment markers
function extractSnippet(content, snippetId = null) {
  const lines = content.split('\n');
  
  // Define comment patterns for different languages
  const commentPatterns = [
    // Hash-style comments (Python, Ruby, Shell, YAML, etc.)
    { start: `#docs-start${snippetId ? `-${snippetId}` : ''}`, end: `#docs-end${snippetId ? `-${snippetId}` : ''}` },
    // Double-slash comments (JavaScript, Java, C++, etc.)
    { start: `//docs-start${snippetId ? `-${snippetId}` : ''}`, end: `//docs-end${snippetId ? `-${snippetId}` : ''}` },
    // Block comments (CSS, SQL, etc.)
    { start: `/*docs-start${snippetId ? `-${snippetId}` : ''}*/`, end: `/*docs-end${snippetId ? `-${snippetId}` : ''}*/` },
    // XML/HTML comments
    { start: `<!--docs-start${snippetId ? `-${snippetId}` : ''}-->`, end: `<!--docs-end${snippetId ? `-${snippetId}` : ''}-->` }
  ];
  
  for (const pattern of commentPatterns) {
    let startIndex = -1;
    let endIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes(pattern.start)) {
        startIndex = i + 1; // Start from the line after the start marker
      } else if (line.includes(pattern.end) && startIndex !== -1) {
        endIndex = i; // End at the line before the end marker
        break;
      }
    }
    
    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      return lines.slice(startIndex, endIndex).join('\n');
    }
  }
  
  // If no snippet markers found, return original content
  return content;
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
            
            // Parse snippet parameter from additional metadata
            const snippetMatch = additionalMeta.match(/snippet=(\w+)/);
            const snippetId = snippetMatch ? snippetMatch[1] : null;
            
            try {
              let importedContent;
              
              if (param.startsWith('file=')) {
                // Handle file import
                const importPath = param.replace('file=', '');
                const absoluteImportPath = path.resolve(context.siteDir, importPath);
                const rawContent = fs.readFileSync(absoluteImportPath, 'utf8');
                importedContent = extractSnippet(rawContent, snippetId);
              } else if (param.startsWith('url=')) {
                // Handle URL import
                const url = param.replace('url=', '');
                try {
                  const rawContent = await fetchUrl(url);
                  importedContent = extractSnippet(rawContent, snippetId);
                } catch (urlError) {
                  console.warn(`Could not fetch URL ${url} in ${filePath}: ${urlError.message}`);
                  process.exit(1);
                  continue; // Skip this replacement if URL fetch fails
                }
              }
              
              // Preserve the complete metadata
              const fullMeta = `${param}${additionalMeta}`;
              const metaStr = fullMeta ? ` ${fullMeta}` : '';
              const replacement = `\`\`\`${lang || ''}${metaStr}\n${importedContent}\n\`\`\``;
              
              content = content.replace(fullMatch, replacement);
              modified = true;
              
            } catch (error) {
              console.warn(`Could not process ${param} in ${filePath}: ${error.message}`);
              process.exit(1);
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
          process.exit(1);
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
          process.exit(1);
        }
      }
    }
  };
}

module.exports = codeImportPlugin;
