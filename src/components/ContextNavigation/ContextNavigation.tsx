// src/components/ContextNavigation.tsx
import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';

// Import the related docs data - adjust path as needed
let relatedDocsData;
try {
  relatedDocsData = require('../../data/related-docs.json');
} catch (e) {
  try {
    relatedDocsData = require('../../../data/related-docs.json');
  } catch (e2) {
    try {
      relatedDocsData = require('../../related-docs.json');
    } catch (e3) {
      relatedDocsData = {};
    }
  }
}

export default function ContextNavigation() {
  const { metadata } = useDoc();
  const frontMatter = metadata?.frontMatter || {};
  const docType = frontMatter?.doc_type;
  
  // Early return if no docType or no related docs data
  if (!docType || !relatedDocsData || Object.keys(relatedDocsData).length === 0) {
    return null;
  }
  
  // Get current doc data - try multiple ID formats
  const currentPath = metadata?.permalink?.replace('/docs/', '') || metadata?.slug?.replace('/docs/', '');
  const cleanPath = currentPath?.replace(/\/$/, ''); // Remove trailing slash
  
  const possibleIds = [
    cleanPath,                                    // New format: "optimize/query-optimization" 
    `https://clickhouse.com${currentPath}`,      // Old format with domain
    `https://clickhouse.com/docs/${cleanPath}`,  // Old format with /docs/
    currentPath,                                 // Raw path
    metadata?.id,                                // Docusaurus ID
    // Add fragment-based matching for sections
    cleanPath && cleanPath.includes('#') ? cleanPath.split('#')[0] : null,
  ].filter(Boolean);
  
  let docId = null;
  let rawDocs = [];
  
  // Try each possible ID format
  for (const id of possibleIds) {
    if (relatedDocsData[id] && Array.isArray(relatedDocsData[id]) && relatedDocsData[id].length > 0) {
      docId = id;
      rawDocs = relatedDocsData[id];
      break;
    }
  }
  
  // If no direct match, try fuzzy matching for similar paths
  if (rawDocs.length === 0 && cleanPath) {
    const availableKeys = Object.keys(relatedDocsData);
    const fuzzyMatches = availableKeys.filter(key => {
      // Remove domain prefixes for comparison
      const normalizedKey = key.replace('https://clickhouse.com/docs/', '').replace('https://clickhouse.com/', '');
      const normalizedPath = cleanPath.replace('/docs/', '');
      
      return normalizedKey.includes(normalizedPath) || normalizedPath.includes(normalizedKey);
    });
    
    if (fuzzyMatches.length > 0) {
      docId = fuzzyMatches[0];
      rawDocs = relatedDocsData[docId] || [];
    }
  }
  
  if (rawDocs.length === 0) {
    return null;
  }
  
  // Enhanced filtering with doc_type awareness and deduplication
  const currentDocType = docType;
  const relatedDocs = rawDocs
    .filter(doc => {
      // Basic quality filtering
      if (!doc.title || doc.similarity_score < 20) return false;
      
      // Filter out self-references
      if (doc.id === cleanPath || doc.url?.includes(cleanPath)) return false;
      
      return true;
    })
    .map(doc => ({
      ...doc,
      // Add doc_type preference boost
      boosted_score: calculateBoostedScore(doc, currentDocType)
    }))
    .filter((doc, index, arr) => {
      // Remove duplicates by title and URL (keep highest scored)
      const duplicateIndex = arr.findIndex(d => 
        d.title === doc.title || 
        (d.url && doc.url && normalizeUrl(d.url) === normalizeUrl(doc.url))
      );
      return duplicateIndex === index;
    })
    .sort((a, b) => (b.boosted_score || 0) - (a.boosted_score || 0))
    .slice(0, 4); // Show up to 4 related docs
  
  if (relatedDocs.length === 0) return null;
  
  return (
    <div style={{ 
      borderTop: '1px solid var(--ifm-color-emphasis-200)',
      paddingTop: '0.75rem',
      marginTop: '1.5rem'
    }}>
      <h2>More Reading</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {relatedDocs.map((doc, index) => (
          <RelatedDocLink key={index} doc={doc} currentDocType={currentDocType} />
        ))}
      </div>
    </div>
  );
}

// Helper function to normalize URLs for comparison only
function normalizeUrl(url) {
  if (!url) return '';
  
  return url
    .replace('https://clickhouse.com', '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();
}

// Helper function to calculate boosted score based on doc_type compatibility
function calculateBoostedScore(doc, currentDocType) {
  let score = doc.similarity_score || 50;
  
  // Same doc_type gets a significant boost
  if (doc.doc_type === currentDocType) {
    score += 25;
  }
  
  // Compatible doc_type combinations get smaller boosts
  const compatibilityBonus = {
    'tutorial': { 'how-to': 15, 'explanation': 10, 'overview': 5 },
    'how-to': { 'tutorial': 15, 'explanation': 12, 'overview': 5 },
    'explanation': { 'tutorial': 10, 'how-to': 12, 'overview': 8 },
    'overview': { 'tutorial': 5, 'how-to': 5, 'explanation': 8 },
    'reference': { 'overview': 8, 'explanation': 5 }
  };
  
  const bonus = compatibilityBonus[currentDocType]?.[doc.doc_type] || 0;
  score += bonus;
  
  // Boost high-quality matches
  if (doc.similarity_score > 80) score += 10;
  if (doc.reason && doc.reason.includes('Similar topics')) score += 5;
  
  return Math.round(score);
}

// Helper function to get friendly doc_type labels
function getDocTypeLabel(docType) {
  const labels = {
    'tutorial': 'Tutorials',
    'how-to': 'Guides', 
    'explanation': 'Concepts',
    'overview': 'Overviews',
    'reference': 'References'
  };
  return labels[docType] || 'Content';
}

  // Individual related doc link component
function RelatedDocLink({ doc, currentDocType }) {
  // Keep consistent styling - all bubbles look the same
  const isHighRelevance = false; // Remove visual distinction, rely on order instead
  
  // Clean the URL - handle both old and new formats more carefully
  let cleanUrl = doc.url;
  if (cleanUrl) {
    // Remove the domain but preserve the rest of the path
    cleanUrl = cleanUrl
      .replace('https://clickhouse.com', '')
      .replace(/\/+/g, '/'); // Clean up any double slashes
    
    // Fix specific malformed URLs from Algolia
    if (cleanUrl === '/docsmigrations') {
      cleanUrl = '/docs/migrations';
    }
    
    // Ensure it starts with /docs/
    if (!cleanUrl.startsWith('/docs/')) {
      // If it doesn't start with /docs/, prepend it
      const pathWithoutLeadingSlash = cleanUrl.startsWith('/') ? cleanUrl.substring(1) : cleanUrl;
      cleanUrl = `/docs/${pathWithoutLeadingSlash}`;
    }
    
  } else if (doc.id) {
    // Fallback to ID-based URL
    const cleanId = doc.id.startsWith('/') ? doc.id.substring(1) : doc.id;
    cleanUrl = `/docs/${cleanId}`;
  } else {
    // Emergency fallback - don't render if no valid URL
    return null;
  }
  
  // Final validation - make sure the URL looks reasonable
  if (!cleanUrl || cleanUrl === '/docs/' || cleanUrl === '/docs') {
    return null;
  }
  
  return (
    <Link
      to={cleanUrl}
      style={{ 
        color: 'var(--ifm-font-color-base)',
        textDecoration: 'none',
        fontSize: '0.85rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: 'var(--ifm-color-emphasis-100)', // Same color for all
        borderRadius: '12px',
        border: '1px solid var(--ifm-color-emphasis-200)', // Same border for all
        transition: 'all 0.2s ease',
        display: 'inline-block',
        lineHeight: 1.3,
        position: 'relative',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.backgroundColor = 'var(--ifm-color-emphasis-200)'; // Same hover for all
        target.style.transform = 'translateY(-1px)';
        // Show full title on hover
        target.style.whiteSpace = 'normal';
        target.style.overflow = 'visible';
        target.style.zIndex = '10';
        target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.backgroundColor = 'var(--ifm-color-emphasis-100)'; // Same for all
        target.style.transform = 'translateY(0)';
        target.style.whiteSpace = 'nowrap';
        target.style.overflow = 'hidden';
        target.style.zIndex = 'auto';
        target.style.boxShadow = 'none';
      }}
      title={doc.title}
    >
      {doc.title}
      {/* Remove star indicator since all bubbles look the same now */}
    </Link>
  );
}