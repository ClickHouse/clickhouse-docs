// src/components/ContextNavigation.tsx
import React from 'react';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import { galaxyOnClick } from '../../lib/galaxy/galaxy';
import Link from '@docusaurus/Link';

// Configuration constants
const CONFIG = {
  MIN_SIMILARITY_SCORE: 20,
  MAX_RELATED_DOCS: 4,
  SAME_TYPE_BOOST: 25,
} as const;

// Load related docs data with error handling
let relatedDocsData: Record<string, any[]> = {};
try {
  relatedDocsData = require('../../data/related-docs.json');
} catch (error) {
  console.warn('[ContextNavigation] Could not load related-docs.json:', error.message);
}

/**
 * Context Navigation Component
 * Shows related documents based on current page and doc_type
 */
export default function ContextNavigation(): JSX.Element | null {
  const { metadata } = useDoc();
  const frontMatter = metadata?.frontMatter || {};
  const docType = frontMatter?.doc_type;
  
  // Early validation
  if (!docType || !relatedDocsData || Object.keys(relatedDocsData).length === 0) {
    return null;
  }
  
  // Extract current document path
  const currentPath = extractCurrentPath(metadata);
  if (!currentPath) return null;
  
  // Find and process related documents
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

/**
 * Extract the current document path from metadata
 */
function extractCurrentPath(metadata: any): string {
  return metadata?.permalink?.replace('/docs/', '') || 
         metadata?.slug?.replace('/docs/', '') || 
         '';
}

/**
 * Find related documents using path variants and process them
 */
function findRelatedDocs(currentPath: string, data: Record<string, any[]>, currentDocType: string): ProcessedDoc[] {
  // Generate path variants to handle different naming conventions
  const pathVariants = generatePathVariants(currentPath);
  
  // Find matching documents
  const rawDocs = findMatchingDocs(pathVariants, data);
  
  // Process and filter the results
  return processRelatedDocs(rawDocs, currentPath, currentDocType);
}

/**
 * Generate different path variants to handle underscore/hyphen differences
 */
function generatePathVariants(path: string): string[] {
  const variants = [
    path,
    path.replace(/_/g, '-'),  // underscores to hyphens
    path.replace(/-/g, '_'),  // hyphens to underscores
  ];
  
  // Also try without leading slash (if present)
  if (path.startsWith('/')) {
    const withoutSlash = path.replace(/^\//, '');
    variants.push(
      withoutSlash,
      withoutSlash.replace(/_/g, '-'),
      withoutSlash.replace(/-/g, '_')
    );
  }
  
  // Remove duplicates
  return [...new Set(variants)];
}

/**
 * Find documents matching any of the path variants
 */
function findMatchingDocs(pathVariants: string[], data: Record<string, any[]>): any[] {
  for (const variant of pathVariants) {
    const docs = data[variant];
    if (docs?.length > 0) {
      return docs;
    }
  }
  return [];
}

/**
 * Process and filter related documents
 */
function processRelatedDocs(rawDocs: any[], currentPath: string, currentDocType: string): ProcessedDoc[] {
  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();
  
  return rawDocs
    .filter((doc) => isValidRelatedDoc(doc, currentPath, seenTitles, seenUrls))
    .map((doc) => enhanceDoc(doc, currentDocType))
    .sort((a, b) => (b.boosted_score || 0) - (a.boosted_score || 0))
    .slice(0, CONFIG.MAX_RELATED_DOCS);
}

/**
 * Check if a document is valid for inclusion in related docs
 */
function isValidRelatedDoc(
  doc: any, 
  currentPath: string, 
  seenTitles: Set<string>, 
  seenUrls: Set<string>
): boolean {
  // Basic validation
  if (!doc.title || doc.similarity_score < CONFIG.MIN_SIMILARITY_SCORE) {
    return false;
  }
  
  // Filter out self-references
  if (doc.id === currentPath || doc.url?.includes(currentPath)) {
    return false;
  }
  
  // Deduplicate by title and URL
  const normalizedUrl = normalizeUrl(doc.url);
  if (seenTitles.has(doc.title) || seenUrls.has(normalizedUrl)) {
    return false;
  }
  
  // Add to seen sets
  seenTitles.add(doc.title);
  seenUrls.add(normalizedUrl);
  
  return true;
}

/**
 * Enhance a document with display title and boosted score
 */
function enhanceDoc(doc: any, currentDocType: string): ProcessedDoc {
  return {
    ...doc,
    displayTitle: getDisplayTitle(doc),
    boosted_score: calculateBoostedScore(doc, currentDocType)
  };
}

/**
 * Get the best title to display (prioritize page title over section headers)
 */
function getDisplayTitle(doc: any): string {
  // Try hierarchy.lvl0 (usually the frontmatter title)
  if (doc.hierarchy?.lvl0?.trim() && doc.hierarchy.lvl0 !== doc.title) {
    return doc.hierarchy.lvl0.trim();
  }
  
  // For merged page-level docs, use the main title
  if (doc.type === 'page' && doc.title) {
    return doc.title;
  }
  
  // Try lvl0 if different from title
  if (doc.lvl0?.trim() && doc.lvl0 !== doc.title) {
    return doc.lvl0.trim();
  }
  
  // Fallback to document title
  return doc.title || 'Untitled';
}

/**
 * Normalize URL for comparison purposes
 */
function normalizeUrl(url: string): string {
  if (!url) return '';
  
  return url
    .replace('https://clickhouse.com', '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();
}

/**
 * Calculate boosted score - trust Algolia's similarity + boost same doc types
 */
function calculateBoostedScore(doc: any, currentDocType: string): number {
  const baseScore = doc.similarity_score || 50;
  
  // Same doc_type gets a boost, everything else relies on Algolia's similarity
  return doc.doc_type === currentDocType 
    ? baseScore + CONFIG.SAME_TYPE_BOOST 
    : baseScore;
}

/**
 * Related document link component
 */
function RelatedDocLink({ doc }: { doc: ProcessedDoc }): JSX.Element | null {
  const cleanUrl = cleanDocUrl(doc.url);
  
  if (!cleanUrl || cleanUrl === '/docs/' || cleanUrl === '/docs') {
    return null;
  }
  
  const handleClick = () => {
    galaxyOnClick('contextNav.navItems.relatedDocSelect');
  };
  
  const titleToShow = doc.displayTitle || doc.title;
  
  return (
    <Link
      to={cleanUrl}
      onClick={handleClick}
      className="related-doc-link"
      style={linkStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={titleToShow}
    >
      {titleToShow}
    </Link>
  );
}

/**
 * Clean document URL for internal linking
 */
function cleanDocUrl(url: string): string {
  return url
    ?.replace('https://clickhouse.com', '')
    .replace(/\/+/g, '/') || '';
}

/**
 * Link styles object
 */
const linkStyles: React.CSSProperties = {
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
};

/**
 * Handle mouse enter for link hover effects
 */
function handleMouseEnter(e: React.MouseEvent<HTMLAnchorElement>): void {
  const target = e.currentTarget;
  target.style.backgroundColor = 'var(--ifm-color-emphasis-200)';
  target.style.transform = 'translateY(-1px)';
  target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
}

/**
 * Handle mouse leave for link hover effects
 */
function handleMouseLeave(e: React.MouseEvent<HTMLAnchorElement>): void {
  const target = e.currentTarget;
  target.style.backgroundColor = 'var(--ifm-color-emphasis-100)';
  target.style.transform = 'translateY(0)';
  target.style.boxShadow = 'none';
}

// Type definitions
interface ProcessedDoc {
  id: string;
  title: string;
  url: string;
  doc_type: string;
  reason: string;
  similarity_score: number;
  displayTitle: string;
  boosted_score: number;
  [key: string]: any;
}