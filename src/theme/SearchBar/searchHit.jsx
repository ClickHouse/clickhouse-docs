import Link from '@docusaurus/Link';
import { trackSearchResultClick } from './utils/searchAnalytics';

export function SearchHit({ hit, children }) {
  const handleClick = () => trackSearchResultClick(hit);
  
  // Extract multiple URL segments after /docs/ and clean them up
  const segments = hit.url.split('/docs/')[1]?.split('/').filter(Boolean) || [];
  const breadcrumbs = segments
    .slice(0, 3) // Take first 3 segments max
    .map(segment => segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  
  return (
    <Link onClick={handleClick} to={hit.url}>
      {children}
      {breadcrumbs.length > 0 && (
        <span style={{ 
          fontSize: '10px', 
          color: '#888',
          display: 'block',
          lineHeight: '1',
          marginBottom: '12px'
        }}>
          {breadcrumbs.join(' › ')}
        </span>
      )}
    </Link>
  );
}
