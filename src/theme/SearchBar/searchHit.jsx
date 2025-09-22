import Link from '@docusaurus/Link';
import { trackSearchResultClick } from './utils/searchAnalytics';

export function SearchHit({ hit, children }) {
  const handleClick = () => trackSearchResultClick(hit);
  
  // Extract multiple URL segments after /docs/ and clean them up
  const segments = hit.url.split('/docs/')[1]?.split('/').filter(Boolean) || [];
  const breadcrumbs = segments
    .slice(0, 3) // Take first 3 segments max
    .map(segment => segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  
  // Format doc_type for display, stripping quotes and formatting
  const formatDocType = (docType) => {
    if (!docType) return null;
    // Remove surrounding quotes and format
    const cleaned = docType.replace(/^'|'$/g, '');
    return cleaned.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const docTypeDisplay = formatDocType(hit.doc_type);
  
  return (
    <Link onClick={handleClick} to={hit.url}>
      {children}
      <div style={{ 
        fontSize: '10px', 
        color: '#888',
        lineHeight: '1',
        marginBottom: '12px'
      }}>
        {/* Doc type badge */}
        {docTypeDisplay && (
          <span style={{ 
            backgroundColor: '#f3f4f6',
            color: '#374151',
            padding: '2px 6px',
            borderRadius: '3px',
            marginRight: '8px',
            fontWeight: '500'
          }}>
            {docTypeDisplay}
          </span>
        )}
        
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <span>{breadcrumbs.join(' › ')}</span>
        )}
      </div>
    </Link>
  );
}
