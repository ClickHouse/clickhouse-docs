// generate-algolia-related.js
// Enhanced with doc_type intelligence and improved semantic matching
// Updated for modern Algolia API and better error handling
// Modified to get all results and merge to page-level entries

const { algoliasearch } = require('algoliasearch');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config(); // Add this dependency: npm install dotenv

// Use environment variables for security
const APP_ID = process.env.ALGOLIA_APP_ID || '7AL1W7YVZK';
const API_KEY = process.env.ALGOLIA_API_KEY;
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || 'clickhouse';

if (!API_KEY) {
  console.error('❌ ALGOLIA_API_KEY environment variable is required');
  process.exit(1);
}

// Updated for Algolia v5+ API
const client = algoliasearch(APP_ID, API_KEY);

// doc_type priority scores (matching your indexing script)
const DOC_TYPE_SCORES = {
  'tutorial': 1000,
  'how-to': 900,
  'explanation': 800,
  'overview': 700,
  'reference': 100
};

// Rate limiting helper
class RateLimiter {
  constructor(requestsPerSecond = 10) {
    this.requestsPerSecond = requestsPerSecond;
    this.interval = 1000 / requestsPerSecond;
    this.lastRequestTime = 0;
  }

  async waitIfNeeded() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.interval) {
      const waitTime = this.interval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

const rateLimiter = new RateLimiter(8); // 8 requests per second to be safe

// Function to merge section-level docs into page-level docs
function mergeToPageLevel(allDocs) {
  console.log('🔄 Merging section-level entries into page-level documents...');
  
  const pageMap = new Map();
  
  allDocs.forEach(doc => {
    if (!doc.url) return;
    
    // Get the base URL without hash fragment
    const baseUrl = doc.url.split('#')[0];
    
    if (!pageMap.has(baseUrl)) {
      // Create a new page entry
      const pageDoc = {
        objectID: doc.objectID,
        title: doc.title || '',
        content: doc.content || '',
        url: baseUrl,
        type: 'page', // Mark as merged page-level doc
        lvl0: doc.lvl0 || '',
        lvl1: doc.lvl1 || '',
        doc_type: doc.doc_type || 'reference',
        doc_type_score: doc.doc_type_score || DOC_TYPE_SCORES[doc.doc_type] || 100,
        keywords: doc.keywords || '',
        sections: [] // Track what sections were merged
      };
      
      pageMap.set(baseUrl, pageDoc);
    }
    
    const pageDoc = pageMap.get(baseUrl);
    
    // Merge content from sections
    if (doc.content && !pageDoc.content.includes(doc.content)) {
      pageDoc.content += ' ' + doc.content;
    }
    
    // Merge keywords
    if (doc.keywords && !pageDoc.keywords.includes(doc.keywords)) {
      pageDoc.keywords += (pageDoc.keywords ? ', ' : '') + doc.keywords;
    }
    
    // Track sections that were merged
    if (doc.url.includes('#')) {
      pageDoc.sections.push({
        title: doc.title,
        type: doc.type,
        url: doc.url
      });
    }
    
    // Prefer page-level titles over section titles
    if (!doc.url.includes('#') && doc.title) {
      pageDoc.title = doc.title;
      pageDoc.objectID = doc.objectID; // Use page-level objectID
    }
    
    // Use the highest priority doc_type found
    const currentScore = DOC_TYPE_SCORES[pageDoc.doc_type] || 100;
    const newScore = DOC_TYPE_SCORES[doc.doc_type] || 100;
    if (newScore > currentScore) {
      pageDoc.doc_type = doc.doc_type;
      pageDoc.doc_type_score = newScore;
    }
  });
  
  const mergedDocs = Array.from(pageMap.values());
  
  console.log(`  📄 Merged ${allDocs.length} entries into ${mergedDocs.length} page-level documents`);
  
  // Show merge statistics
  const sectionStats = {};
  mergedDocs.forEach(doc => {
    const sectionCount = doc.sections.length;
    sectionStats[sectionCount] = (sectionStats[sectionCount] || 0) + 1;
  });
  
  console.log('  📊 Sections per page distribution:', sectionStats);
  
  return mergedDocs;
}

async function getAllDocsWithRetry(maxRetries = 3) {
  console.log('📚 Getting all docs using efficient multi-query approach...');
  console.log('💰 Estimating ~10 API calls for discovery');
  
  const allHits = [];
  const seenObjectIDs = new Set();
  
  const queries = [
    { query: '', hitsPerPage: 1000 }, // Get the main 1000
    { filters: 'url:*/sql-reference/*', hitsPerPage: 200 },
    { filters: 'url:*/cloud/*', hitsPerPage: 200 },
    { filters: 'url:*/integrations/*', hitsPerPage: 200 },
    { filters: 'url:*/guides/*', hitsPerPage: 200 },
    { filters: 'url:*/chdb/*', hitsPerPage: 200 },
    { filters: 'type:lvl1', hitsPerPage: 500 },
    { filters: 'type:lvl2', hitsPerPage: 500 },
    { query: 'reference', hitsPerPage: 300 },
    { query: 'tutorial guide', hitsPerPage: 300 }
  ];
  
  for (const [index, searchParams] of queries.entries()) {
    let retries = 0;
    let success = false;
    
    while (!success && retries < maxRetries) {
      try {
        await rateLimiter.waitIfNeeded();
        
        const response = await client.searchSingleIndex({
          indexName: INDEX_NAME,
          searchParams: {
            ...searchParams,
            attributesToRetrieve: [
              'objectID', 'title', 'content', 'url', 'type', 'lvl0', 'lvl1',
              'doc_type', 'doc_type_score', 'keywords', 'h1', 'h2', 'h3'
            ]
          }
        });
        
        let newHits = 0;
        for (const hit of response.hits) {
          if (!seenObjectIDs.has(hit.objectID)) {
            seenObjectIDs.add(hit.objectID);
            allHits.push(hit);
            newHits++;
          }
        }
        
        console.log(`  ✅ Query ${index + 1}: ${newHits} new docs (total: ${allHits.length})`);
        success = true;
        
      } catch (error) {
        retries++;
        console.warn(`  ⚠️ Query ${index + 1} failed (attempt ${retries}/${maxRetries}):`, error.message);
        
        if (retries < maxRetries) {
          const backoffTime = Math.pow(2, retries) * 1000; // Exponential backoff
          console.log(`    Retrying in ${backoffTime / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
    
    if (!success) {
      console.error(`  ❌ Query ${index + 1} failed after ${maxRetries} attempts`);
    }
  }
  
  console.log(`\n🎉 Raw result: ${allHits.length} unique documents`);
  
  // Now merge to page-level
  const mergedDocs = mergeToPageLevel(allHits);
  
  return mergedDocs;
}

function calculateDocTypeCompatibility(sourceDoc, targetDoc) {
  const sourceType = sourceDoc.doc_type || 'reference';
  const targetType = targetDoc.doc_type || 'reference';
  
  // Same doc_type gets highest bonus
  if (sourceType === targetType) {
    return 100;
  }
  
  // Compatible doc_type combinations
  const compatibilityMap = {
    'tutorial': { 'how-to': 80, 'explanation': 60, 'overview': 40, 'reference': 20 },
    'how-to': { 'tutorial': 80, 'explanation': 70, 'overview': 30, 'reference': 25 },
    'explanation': { 'tutorial': 60, 'how-to': 70, 'overview': 50, 'reference': 30 },
    'overview': { 'tutorial': 40, 'how-to': 30, 'explanation': 50, 'reference': 60 },
    'reference': { 'tutorial': 20, 'how-to': 25, 'explanation': 30, 'overview': 60 }
  };
  
  return compatibilityMap[sourceType]?.[targetType] || 10;
}

function calculateKeywordSimilarity(sourceDoc, targetDoc) {
  const sourceKeywords = parseKeywords(sourceDoc.keywords);
  const targetKeywords = parseKeywords(targetDoc.keywords);
  
  if (sourceKeywords.length === 0 || targetKeywords.length === 0) {
    return 0;
  }
  
  const intersection = sourceKeywords.filter(k => 
    targetKeywords.some(tk => tk.includes(k) || k.includes(tk))
  );
  
  return (intersection.length / Math.max(sourceKeywords.length, targetKeywords.length)) * 100;
}

function parseKeywords(keywordString) {
  if (!keywordString || typeof keywordString !== 'string') return [];
  
  return keywordString
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 2); // Filter out very short keywords
}

function isDuplicateContent(sourceDoc, targetDoc) {
  // Compare base URLs without fragments since we're dealing with page-level docs
  if (sourceDoc.url && targetDoc.url) {
    const sourceBase = sourceDoc.url.split('#')[0];
    const targetBase = targetDoc.url.split('#')[0];
    return sourceBase === targetBase;
  }
  return false;
}

function prepareSearchQuery(doc) {
  let searchText = doc.content || doc.title || '';
  
  if (!searchText.trim()) {
    return '';
  }
  
  // Clean up the content first
  searchText = searchText
    .replace(/[`*_#\[\](){}]/g, ' ') // Remove markdown formatting
    .replace(/https?:\/\/[^\s]+/g, ' ') // Remove URLs
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Smart truncation - keep complete sentences
  if (searchText.length > 300) {
    const truncated = searchText.substring(0, 300);
    const lastSentence = truncated.lastIndexOf('.');
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSentence > 150) {
      searchText = truncated.substring(0, lastSentence + 1);
    } else if (lastSpace > 150) {
      searchText = truncated.substring(0, lastSpace);
    } else {
      searchText = truncated;
    }
  }
  
  // Add top keywords if there's space
  if (doc.keywords && searchText.length < 250) {
    const keywords = parseKeywords(doc.keywords).slice(0, 3);
    const keywordText = keywords.join(' ');
    searchText += ` ${keywordText}`;
  }
  
  // Final length check (Algolia query limit is around 512 bytes)
  if (searchText.length > 400) {
    searchText = searchText.substring(0, 400);
  }
  
  return searchText.trim();
}

async function findRelatedDocs(doc, allDocs, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await rateLimiter.waitIfNeeded();
      
      const searchText = prepareSearchQuery(doc);
      
      if (!searchText) {
        console.warn(`⚠️ Empty search text for ${doc.objectID}, using title only`);
        const fallbackQuery = doc.title?.substring(0, 100) || 'untitled';
        if (!fallbackQuery || fallbackQuery === 'untitled') {
          return [];
        }
      }
      
      // Search against the original Algolia index (not our merged docs)
      const response = await client.searchSingleIndex({
        indexName: INDEX_NAME,
        searchParams: {
          query: searchText || doc.title?.substring(0, 100),
          hitsPerPage: 20, // Get more results since we'll merge them
          filters: `NOT objectID:${doc.objectID}`,
          attributesToRetrieve: [
            'objectID', 'title', 'url', 'type', 'lvl0', 'lvl1', 
            'doc_type', 'doc_type_score', 'keywords', 'content'
          ],
          typoTolerance: true,
          ignorePlurals: true
        }
      });
      
      // Merge the search results to page-level before ranking
      const mergedResults = mergeToPageLevel(response.hits);
      
      // Enhanced filtering and ranking
      const candidates = mergedResults
        .filter(hit => {
          if (hit.objectID === doc.objectID || hit.title === doc.title) return false;
          if (isDuplicateContent(doc, hit)) return false;
          return true;
        })
        .map((hit, index) => {
          const docTypeBonus = calculateDocTypeCompatibility(doc, hit);
          const keywordSimilarity = calculateKeywordSimilarity(doc, hit);
          const positionScore = Math.max(0, 100 - (index * 5)); // Position in search results
          
          // Combined score with weights
          const totalScore = (
            positionScore * 0.4 +           // Algolia's ranking
            docTypeBonus * 0.35 +          // doc_type compatibility  
            keywordSimilarity * 0.25       // Keyword overlap
          );
          
          return {
            ...hit,
            enhanced_score: Math.round(totalScore),
            doc_type_bonus: docTypeBonus,
            keyword_similarity: Math.round(keywordSimilarity),
            position_score: positionScore
          };
        })
        .sort((a, b) => b.enhanced_score - a.enhanced_score)
        .slice(0, 5)
        .map((hit) => ({
          id: hit.url?.replace('https://clickhouse.com/docs/', '').replace(/\/$/, '') || hit.objectID,
          title: hit.title || hit.objectID || 'Untitled',
          url: hit.url,
          type: hit.type,
          doc_type: hit.doc_type || 'reference',
          reason: generateReason(hit, doc),
          similarity_score: hit.enhanced_score,
          sections_merged: hit.sections?.length || 0,
          debug: {
            doc_type_bonus: hit.doc_type_bonus,
            keyword_similarity: hit.keyword_similarity,
            position_score: hit.position_score
          }
        }));
        
      return candidates;
      
    } catch (error) {
      retries++;
      console.warn(`⚠️ Error finding related docs for ${doc.objectID} (attempt ${retries}/${maxRetries}):`, error.message);
      
      if (retries < maxRetries) {
        const backoffTime = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  console.error(`❌ Failed to find related docs for ${doc.objectID} after ${maxRetries} attempts`);
  return [];
}

function generateReason(relatedDoc, sourceDoc) {
  const reasons = [];
  
  if (relatedDoc.doc_type === sourceDoc.doc_type) {
    const typeNames = {
      'tutorial': 'tutorial',
      'how-to': 'how-to guide', 
      'explanation': 'explanation',
      'overview': 'overview',
      'reference': 'reference'
    };
    reasons.push(`Same type (${typeNames[sourceDoc.doc_type] || sourceDoc.doc_type})`);
  }
  
  if (relatedDoc.keyword_similarity > 30) {
    reasons.push('Similar topics');
  }
  
  if (relatedDoc.doc_type_bonus > 60) {
    reasons.push('Compatible content');
  }
  
  if (relatedDoc.sections_merged > 3) {
    reasons.push('Comprehensive page');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : `Related content (${relatedDoc.enhanced_score}% match)`;
}

function isNavigationPage(doc) {
  if (!doc.title || !doc.url) return true;
  
  const navigationPatterns = [
    /^index$/i,
    /overview$/i,
    /introduction$/i,
    /getting.started$/i,
    /^intro$/i,
    /concepts$/i
  ];
  
  const docId = doc.url.replace('/docs/', '').replace('/', '');
  return navigationPatterns.some(pattern => pattern.test(docId)) ||
         doc.title.toLowerCase().includes('overview') ||
         doc.title.toLowerCase().includes('index');
}

async function generateRelatedDocs() {
  try {
    console.log('🚀 Starting enhanced Algolia-powered related docs generation (PAGE-LEVEL MERGING)...\n');
    
    // Get all docs and merge to page-level
    const allDocs = await getAllDocsWithRetry();
    
    if (allDocs.length === 0) {
      throw new Error('No documents retrieved from Algolia');
    }
    
    // Filter for quality content
    const contentDocs = allDocs.filter(doc => 
      doc.objectID && 
      (doc.title || doc.url) &&
      !isNavigationPage(doc)
    );
    
    console.log(`📖 Processing ${contentDocs.length} page-level docs (filtered from ${allDocs.length} merged)`);
    
    // Show doc_type distribution
    const docTypeStats = {};
    contentDocs.forEach(doc => {
      const type = doc.doc_type || 'unknown';
      docTypeStats[type] = (docTypeStats[type] || 0) + 1;
    });
    
    console.log(`📊 Doc type distribution:`, docTypeStats);
    
    // Show sections merged distribution
    const sectionStats = {};
    contentDocs.forEach(doc => {
      const count = doc.sections?.length || 0;
      const bucket = count === 0 ? '0' : count <= 3 ? '1-3' : count <= 10 ? '4-10' : '10+';
      sectionStats[bucket] = (sectionStats[bucket] || 0) + 1;
    });
    
    console.log(`📄 Sections merged per page:`, sectionStats);
    
    const relatedDocsMap = {};
    let processed = 0;
    let errors = 0;
    
    // Process docs in smaller batches with better error handling
    const batchSize = 5; // Reduced batch size for better rate limiting
    for (let i = 0; i < contentDocs.length; i += batchSize) {
      const batch = contentDocs.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (doc) => {
        try {
          const docId = doc.url?.replace('https://clickhouse.com/docs/', '').replace(/\/$/, '') || doc.objectID;
          const relatedDocs = await findRelatedDocs(doc, contentDocs);
          relatedDocsMap[docId] = relatedDocs;
          
          processed++;
          if (processed % 25 === 0) {
            console.log(`⏳ Processed ${processed}/${contentDocs.length} page-level docs (${errors} errors)...`);
          }
        } catch (error) {
          errors++;
          console.error(`❌ Failed to process doc ${doc.objectID}:`, error.message);
        }
      });
      
      await Promise.all(batchPromises);
      
      // Longer delay between batches for rate limiting
      if (i + batchSize < contentDocs.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Save results with error handling
    const outputPath = 'src/data/related-docs.json';
    try {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(relatedDocsMap, null, 2));
      console.log(`💾 Saved to: ${outputPath}`);
    } catch (error) {
      console.error('❌ Failed to save results:', error);
      throw error;
    }
    
    // Enhanced statistics
    const docsWithRelated = Object.values(relatedDocsMap).filter(related => related.length > 0);
    const avgRelated = docsWithRelated.length > 0 
      ? docsWithRelated.reduce((sum, related) => sum + related.length, 0) / docsWithRelated.length 
      : 0;
    
    console.log(`\n📊 Final Statistics (PAGE-LEVEL MERGED):`);
    console.log(`  - Total page-level docs processed: ${processed}`);
    console.log(`  - Pages with related content: ${docsWithRelated.length}`);
    console.log(`  - Average related docs per page: ${avgRelated.toFixed(1)}`);
    console.log(`  - Errors encountered: ${errors}`);
    console.log(`  - Success rate: ${((processed - errors) / processed * 100).toFixed(1)}%`);
    
    // Show doc_type matching stats
    const typeMatchStats = {};
    Object.values(relatedDocsMap).forEach(related => {
      related.forEach(r => {
        typeMatchStats[r.doc_type] = (typeMatchStats[r.doc_type] || 0) + 1;
      });
    });
    console.log(`  - Related docs by type:`, typeMatchStats);
    
    // Show examples with enhanced scoring
    const examples = Object.entries(relatedDocsMap)
      .filter(([_, related]) => related.length > 0)
      .slice(0, 3);
      
    if (examples.length > 0) {
      console.log(`\n🔍 Examples with enhanced scoring (PAGE-LEVEL MERGED):`);
      examples.forEach(([docId, related]) => {
        console.log(`\n  ${docId}:`);
        related.slice(0, 3).forEach(r => {
          console.log(`    → ${r.title} (${r.similarity_score}% match, ${r.doc_type}, ${r.sections_merged} sections)`);
          console.log(`      Reason: ${r.reason}`);
        });
      });
    }
    
    console.log(`\n🎉 Done! Your related docs now use merged page-level entries with intelligent doc_type matching!`);
    
  } catch (error) {
    console.error('❌ Fatal error generating related docs:', error);
    process.exit(1);
  }
}

// Run the generator
if (require.main === module) {
  generateRelatedDocs();
}

module.exports = { generateRelatedDocs };