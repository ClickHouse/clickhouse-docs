import Link from '@docusaurus/Link';
import { trackSearchResultClick } from './utils/searchAnalytics';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function SearchHit({ hit, children }) {
  const { i18n: { currentLocale } } = useDocusaurusContext();
  const handleClick = () => trackSearchResultClick(hit);

  // Transform the URL to ensure it's correct
  // This is a safety measure in case transformSearchItems doesn't work
  let transformedUrl = hit.url;

  try {
    let pathname, hash;

    // If it's an absolute URL, extract pathname and hash
    if (hit.url.startsWith('http://') || hit.url.startsWith('https://')) {
      const urlObj = new URL(hit.url);
      pathname = urlObj.pathname;
      hash = urlObj.hash;
    } else {
      // It's already a relative URL, split pathname and hash
      const hashIndex = hit.url.indexOf('#');
      if (hashIndex !== -1) {
        pathname = hit.url.substring(0, hashIndex);
        hash = hit.url.substring(hashIndex);
      } else {
        pathname = hit.url;
        hash = '';
      }
    }

    // Now transform the pathname
    if (currentLocale !== 'en') {
      const prefix = `/docs/${currentLocale}`;
      if (pathname.startsWith(prefix)) {
        transformedUrl = pathname.substring(prefix.length) || '/';
      } else {
        transformedUrl = pathname;
      }
    } else {
      const prefix = '/docs';
      if (pathname.startsWith(prefix)) {
        transformedUrl = pathname.substring(prefix.length) || '/';
      } else {
        transformedUrl = pathname;
      }
    }

    transformedUrl += hash;
  } catch (e) {
    // If transformation fails, use original URL
  }

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
    <Link onClick={handleClick} to={transformedUrl}>
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
