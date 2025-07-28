// plugins/glossary-transformer/index.js
const { visit } = require('unist-util-visit');
const fs = require('fs');
const path = require('path');

// Cache glossary terms globally
let cachedGlossary = null;
let glossaryModTime = null;

function createGlossaryTransformer(options = {}) {
  const config = {
    caseSensitive: false,
    validateTerms: true,
    glossaryFile: path.resolve(__dirname, '../src/components/GlossaryTooltip/glossary.json'),
    skipPatterns: [],
    ...options
  };
  
  if (!Array.isArray(config.skipPatterns)) {
    config.skipPatterns = [];
  }
  
  function loadGlossary() {
    if (!fs.existsSync(config.glossaryFile)) {
      console.warn(`Glossary file not found: ${config.glossaryFile}`);
      return new Map();
    }
    
    const stats = fs.statSync(config.glossaryFile);
    if (cachedGlossary && glossaryModTime && stats.mtime <= glossaryModTime) {
      return cachedGlossary;
    }
    
    try {
      const glossaryData = JSON.parse(fs.readFileSync(config.glossaryFile, 'utf8'));
      const glossaryMap = new Map();
      
      Object.entries(glossaryData).forEach(([term, definition]) => {
        glossaryMap.set(term.toLowerCase(), { originalTerm: term, definition });
      });
      
      cachedGlossary = glossaryMap;
      glossaryModTime = stats.mtime;
      console.log(`Loaded ${glossaryMap.size} glossary terms`);
      
      return glossaryMap;
    } catch (error) {
      console.error('Error loading glossary:', error.message);
      return new Map();
    }
  }
  
  function shouldProcess(filePath, fileContent) {
    return filePath?.endsWith('.mdx') && 
           fileContent?.includes('^^') &&
           !config.skipPatterns.some(pattern => 
             pattern instanceof RegExp ? pattern.test(filePath) : filePath.includes(pattern)
           );
  }
  
  return function transformer(tree, file) {
    const filePath = file.path || file.history?.[0] || '';
    const fileContent = file.value || '';
    
    if (!shouldProcess(filePath, fileContent)) {
      return tree;
    }
    
    const glossary = loadGlossary();
    if (glossary.size === 0) return tree;
    
    let transformCount = 0;
    
    visit(tree, 'text', (node, index, parent) => {
      if (!node.value?.includes('^^') || !parent) return;
      
      const pattern = /\^\^([^^\n|]+?)(?:\|([^^\n]*?))?\^\^/g;
      const newNodes = [];
      let lastIndex = 0;
      let match;
      
      while ((match = pattern.exec(node.value)) !== null) {
        const [fullMatch, term, plural = ''] = match;
        const cleanTerm = term.trim();
        const cleanPlural = plural.trim();
        
        // Add text before match
        if (match.index > lastIndex) {
          newNodes.push({
            type: 'text',
            value: node.value.slice(lastIndex, match.index)
          });
        }
        
        // Get original term from glossary or use as-is
        const glossaryEntry = glossary.get(cleanTerm.toLowerCase());
        const originalTerm = glossaryEntry?.originalTerm || cleanTerm;
        
        if (!glossaryEntry && config.validateTerms) {
          console.warn(`Glossary term not found: ${cleanTerm}`);
        }
        
        // Create MDX JSX element
        newNodes.push({
          type: 'mdxJsxTextElement',
          name: 'GlossaryTooltip',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'term', value: originalTerm },
            { type: 'mdxJsxAttribute', name: 'plural', value: cleanPlural }
          ],
          children: []
        });
        
        transformCount++;
        lastIndex = match.index + fullMatch.length;
      }
      
      // Add remaining text
      if (lastIndex < node.value.length) {
        newNodes.push({
          type: 'text',
          value: node.value.slice(lastIndex)
        });
      }
      
      // Replace node if we made changes
      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes);
      }
    });
    
    if (transformCount > 0) {
      console.log(`Processed ${transformCount} glossary terms in: ${path.basename(filePath)}`);
    }
    
    return tree;
  };
}

module.exports = createGlossaryTransformer;