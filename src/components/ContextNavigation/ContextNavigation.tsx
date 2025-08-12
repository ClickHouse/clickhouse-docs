// src/components/ContextNavigation.tsx
import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { galaxyOnClick } from '../../lib/galaxy/galaxy';
import Link from '@docusaurus/Link';

// Load related docs data with error handling
let relatedDocsData;
try {
  relatedDocsData = require('../../data/related-docs.json');
} catch (e) {
  relatedDocsData = {};
}

export default function ContextNavigation() {
  const { metadata } = useDoc();
  const frontMatter = metadata?.frontMatter || {};
  const docType = frontMatter?.doc_type;
  
  // Early returns for invalid states
  if (!docType || !relatedDocsData || Object.keys(relatedDocsData).length === 0) {
    return null;
  }
  
  // Get current document path
  const currentPath = metadata?.permalink?.replace('/docs', '') || metadata?.slug?.replace('/docs', '');
  if (!currentPath) return null;
  
  // Find matching documents with simplified logic
  const relatedDocs = findRelatedDocs(currentPath, relatedDocsData, docType);
  
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
          <RelatedDocLink key={`${doc.id}-${index}`} doc={doc} />
        ))}
      </div>
    </div>
  );
}

// Find related documents - direct key lookup with underscore/hyphen variants
function findRelatedDocs(currentPath: string, data: any, currentDocType: string) {
  // Try the original path first, then underscore/hyphen variants
  const pathVariants = [
    currentPath,
    currentPath.replace(/_/g, '-'),  // underscores to hyphens
    currentPath.replace(/-/g, '_'),  // hyphens to underscores
  ];
  
  let rawDocs: any[] = [];
  
  for (const variant of pathVariants) {
    if (data[variant]?.length > 0) {
      rawDocs = data[variant];
      break;
    }
  }
  
  return processRelatedDocs(rawDocs, currentPath, currentDocType);
}

// Process and filter related documents
function processRelatedDocs(rawDocs: any[], currentPath: string, currentDocType: string) {
  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();
  
  return rawDocs
    .filter(doc => {
      // Basic validation
      if (!doc.title || doc.similarity_score < 20) return false;
      
      // Filter out self-references
      if (doc.id === currentPath || doc.url?.includes(currentPath)) return false;
      
      // Deduplicate by title and URL
      const normalizedUrl = normalizeUrl(doc.url);
      if (seenTitles.has(doc.title) || seenUrls.has(normalizedUrl)) return false;
      
      seenTitles.add(doc.title);
      seenUrls.add(normalizedUrl);
      return true;
    })
    .map(doc => ({
      ...doc,
      boosted_score: calculateBoostedScore(doc, currentDocType)
    }))
    .sort((a, b) => (b.boosted_score || 0) - (a.boosted_score || 0))
    .slice(0, 4);
}

// Simplified URL normalization
function normalizeUrl(url: string): string {
  if (!url) return '';
  
  return url
    .replace('https://clickhouse.com', '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();
}

// Score calculation with doc_type preferences
function calculateBoostedScore(doc: any, currentDocType: string): number {
  let score = doc.similarity_score || 50;
  
  // Same doc_type gets significant boost
  if (doc.doc_type === currentDocType) {
    score += 25;
  }
  
  // Compatible doc_type combinations
  const compatibilityMatrix: Record<string, Record<string, number>> = {
    'tutorial': { 'how-to': 15, 'explanation': 10, 'overview': 5 },
    'how-to': { 'tutorial': 15, 'explanation': 12, 'overview': 5 },
    'explanation': { 'tutorial': 10, 'how-to': 12, 'overview': 8 },
    'overview': { 'tutorial': 5, 'how-to': 5, 'explanation': 8 },
    'reference': { 'overview': 8, 'explanation': 5 }
  };
  
  const bonus = compatibilityMatrix[currentDocType]?.[doc.doc_type] || 0;
  score += bonus;
  
  // Quality bonuses
  if (doc.similarity_score > 80) score += 10;
  if (doc.reason?.includes('Similar topics')) score += 5;
  
  return Math.round(score);
}

// Simplified link component
function RelatedDocLink({ doc }: { doc: any }) {
  // Simple URL cleaning - just remove domain and fix double slashes
  const cleanUrl = doc.url
    ?.replace('https://clickhouse.com', '')
    .replace(/\/+/g, '/');
  
  if (!cleanUrl || cleanUrl === '/docs/' || cleanUrl === '/docs') {
    return null;
  }
  
  const handleClick = () => {
    galaxyOnClick('contextNav.navItems.relatedDocSelect');
  };
  
  return (
    <Link
      to={cleanUrl}
      onClick={handleClick}
      className="related-doc-link"
      style={{
        color: 'var(--ifm-font-color-base)',
        textDecoration: 'none',
        fontSize: '0.85rem',
        padding: '0.25rem 0.5rem',
        backgroundColor: 'var(--ifm-color-emphasis-100)',
        borderRadius: '12px',
        border: '1px solid var(--ifm-color-emphasis-200)',
        transition: 'all 0.2s ease',
        display: 'inline-block',
        lineHeight: 1.3
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.backgroundColor = 'var(--ifm-color-emphasis-200)';
        target.style.transform = 'translateY(-1px)';
        target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement;
        target.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
        target.style.transform = 'translateY(0)';
        target.style.boxShadow = 'none';
      }}
      title={doc.title}
    >
      {doc.title}
    </Link>
  );
}