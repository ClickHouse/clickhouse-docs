const fs = require('fs');
const path = require('path');
const { visit } = require('unist-util-visit');

function createCodeImportPlugin(options = {}) {
  const { baseDir = process.cwd() } = options;
  return function transformer(tree, file) {
    visit(tree, 'code', (node) => {
      const { lang, meta } = node;
      
      // Check if file= is in meta or lang
      let fileMatch = null;
      let filePath = null;
      
      if (meta) {
        fileMatch = meta.match(/file=([^\s]+)/);
      }
      if (!fileMatch && lang) {
        fileMatch = lang.match(/file=([^\s]+)/);
        if (fileMatch) {
          // Extract real language (everything before file=)
          const realLang = lang.split(/\s+file=/)[0].trim();
          node.lang = realLang;
        }
      }
      
      if (!fileMatch) return;
      
      filePath = fileMatch[1];
      const absolutePath = path.resolve(baseDir, filePath);
      
      try {
        const content = fs.readFileSync(absolutePath, 'utf8');
        node.value = content;
        
        // Clean up meta if it had file=
        if (meta && meta.includes('file=')) {
          node.meta = meta.replace(/file=[^\s]+\s*/, '').trim() || null;
        }
      } catch (error) {
        console.warn(`Could not read file ${filePath}: ${error.message}`);
      }
    });
  };
};

module.exports = createCodeImportPlugin;
