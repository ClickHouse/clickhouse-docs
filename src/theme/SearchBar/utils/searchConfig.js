import { isRegexpStringMatch } from '@docusaurus/theme-common';
import { DEFAULT_SEARCH_PARAMS, URL_CONFIG } from '../searchConstants';

/**
 * Helper to create doc_type filters from array or single value
 */
export const createDocTypeFilters = (docTypes) => {
  if (!docTypes) return [];

  const types = Array.isArray(docTypes) ? docTypes : [docTypes];
  return types.map(type => `doc_type:${type}`);
};

/**
 * Merge facet filters from different sources
 * @param {string|string[]} f1 - First set of facet filters
 * @param {string|string[]} f2 - Second set of facet filters
 * @returns {string[]} - Merged facet filters
 */
export function mergeFacetFilters(f1, f2) {
  const normalize = (f) => (typeof f === 'string' ? [f] : f);
  return [...normalize(f1), ...normalize(f2)];
}

/**
 * Create search parameters configuration
 * @param {Object} props - Component props
 * @param {boolean} contextualSearch - Whether to use contextual search
 * @param {string[]} contextualSearchFacetFilters - Contextual facet filters
 * @param {string|string[]} docTypes - Document types to filter by
 * @returns {Object} - Configured search parameters
 */
export function createSearchParameters(props, contextualSearch, contextualSearchFacetFilters, docTypes = null) {
  const configFacetFilters = props.searchParameters?.facetFilters ?? [];
  const docTypeFilters = createDocTypeFilters(docTypes);

  let facetFilters = configFacetFilters;

  if (contextualSearch) {
    facetFilters = mergeFacetFilters(contextualSearchFacetFilters, facetFilters);
  }

  if (docTypeFilters.length > 0) {
    facetFilters = mergeFacetFilters(facetFilters, docTypeFilters);
  }

  return {
    ...props.searchParameters,
    facetFilters,
    // Add doc_type to DocSearch's default attributesToRetrieve
    attributesToRetrieve: [
      "hierarchy.lvl0", "hierarchy.lvl1", "hierarchy.lvl2", "hierarchy.lvl3", "hierarchy.lvl4", "hierarchy.lvl5", "hierarchy.lvl6",
      "content", "type", "url", "doc_type"
    ],
    ...DEFAULT_SEARCH_PARAMS,
  };
}

/**
 * Create navigator for handling search result clicks
 * @param {Object} history - React router history object
 * @param {RegExp} externalUrlRegex - Regex to match external URLs
 * @param {string} currentLocale - Current locale
 * @returns {Object} - Navigator object
 */
export function createSearchNavigator(history, externalUrlRegex, currentLocale) {
  return {
    navigate({ itemUrl }) {
      let url = itemUrl;

      // Only transform if it's an absolute URL (starts with http:// or https://)
      // If it's already a relative path, it's been transformed by transformSearchItems
      if (itemUrl.startsWith('http://') || itemUrl.startsWith('https://')) {
        // Transform the absolute URL from Algolia to a relative path
        try {
          const urlObj = new URL(itemUrl);
          const pathname = urlObj.pathname;
          const hash = urlObj.hash;

          if (currentLocale !== 'en') {
            const prefix = `/docs/${currentLocale}`;
            if (pathname.startsWith(prefix)) {
              url = pathname.substring(prefix.length) || '/';
            } else {
              url = pathname;
            }
          } else {
            const prefix = '/docs';
            if (pathname.startsWith(prefix)) {
              url = pathname.substring(prefix.length) || '/';
            } else {
              url = pathname;
            }
          }

          url += hash;
        } catch (e) {
          // If parsing fails, use as-is
        }
      }
      // else: URL is already relative (transformed), use as-is

      if (isRegexpStringMatch(externalUrlRegex, url)) {
        window.location.href = url;
      } else {
        history.push(url);
      }
    },
  };
}

/**
 * Transform search result items with additional metadata
 * @param {Array} items - Raw search results
 * @param {Object} options - Transform options
 * @param {Function} options.transformItems - Custom transform function from props
 * @param {Function} options.processSearchResultUrl - URL processor function
 * @param {string} options.currentLocale - Current locale
 * @param {Object} options.queryIDRef - Ref containing current query ID
 * @returns {Array} - Transformed search results
 */
export function transformSearchItems(items, options) {
  const { transformItems, processSearchResultUrl, currentLocale, queryIDRef } = options;

  const baseTransform = (items) => items.map((item, index) => {
    let url = item.url;

    // Algolia stores full URLs like https://clickhouse.com/docs/jp/tutorial
    // We need to extract just the path relative to the baseUrl
    // For non-English locales, baseUrl is /docs/{locale}/, so we want /tutorial
    // For English, baseUrl is /docs/, so we want /tutorial

    try {
      // Parse the URL to safely extract the pathname and hash
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const hash = urlObj.hash;

      if (currentLocale !== 'en') {
        // Remove /docs/{locale} prefix, keeping the leading slash
        // e.g., /docs/jp/tutorial -> /tutorial
        const prefix = `/docs/${currentLocale}`;
        if (pathname.startsWith(prefix)) {
          url = pathname.substring(prefix.length) || '/';
        } else {
          url = pathname;
        }
      } else {
        // Remove /docs prefix, keeping the leading slash
        // e.g., /docs/tutorial -> /tutorial
        const prefix = '/docs';
        if (pathname.startsWith(prefix)) {
          url = pathname.substring(prefix.length) || '/';
        } else {
          url = pathname;
        }
      }

      // Append the hash back to the URL
      url += hash;
    } catch (e) {
      // If URL parsing fails, assume it's already a relative path
      // and use the original transformation logic as fallback
      if (currentLocale !== 'en') {
        url = url.replace(`/docs/${currentLocale}/`, '/');
      } else {
        url = url.replace('/docs/', '/');
      }
    }

    const transformed = {
      ...item,
      url,
      index,
      queryID: queryIDRef.current
    };

    return transformed;
  });

  const result = transformItems ? transformItems(items) : baseTransform(items);

  return result;
}