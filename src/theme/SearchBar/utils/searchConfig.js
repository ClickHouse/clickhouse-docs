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
      "hierarchy.lvl0","hierarchy.lvl1","hierarchy.lvl2","hierarchy.lvl3","hierarchy.lvl4","hierarchy.lvl5","hierarchy.lvl6",
      "content","type","url","doc_type"
    ],
    ...DEFAULT_SEARCH_PARAMS,
  };
}

/**
 * Create navigator for handling search result clicks
 * @param {Object} history - React router history object
 * @param {RegExp} externalUrlRegex - Regex to match external URLs
 * @returns {Object} - Navigator object
 */
export function createSearchNavigator(history, externalUrlRegex) {
  return {
    navigate({ itemUrl }) {
      if (isRegexpStringMatch(externalUrlRegex, itemUrl)) {
        window.location.href = itemUrl;
      } else {
        history.push(itemUrl);
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

  // Transform URL from /lang/docs/... to /docs/lang/... for non-English locales
  const transformUrl = (url, locale) => {
    if (locale === 'en') {
      return processSearchResultUrl(url);
    }
    // Match pattern like /ru/docs/... or /zh/docs/... or /jp/docs/...
    const match = url.match(/^\/(ru|zh|jp)\/(docs\/.*)/);
    if (match) {
      const [, lang, docsPath] = match;
      return `/${docsPath}${lang}/`;
    }
    return url;
  };

  const baseTransform = (items) => items.map((item, index) => {
    const transformed = {
      ...item,
      url: transformUrl(item.url, currentLocale),
      index,
      queryID: queryIDRef.current
    };

    return transformed;
  });

  const result = transformItems ? transformItems(items) : baseTransform(items);

  return result;
}
