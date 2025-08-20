import aa from 'search-insights';
import { getGoogleAnalyticsUserIdFromBrowserCookie } from '../../../lib/google/google';

/**
 * Initialize Algolia search analytics
 * @param {string} appId - Algolia app ID
 * @param {string} apiKey - Algolia API key
 */
export function initializeSearchAnalytics(appId, apiKey) {
  if (typeof window === "undefined") return;
  
  const userToken = getGoogleAnalyticsUserIdFromBrowserCookie('_ga');
  aa('init', {
    appId,
    apiKey,
  });
  aa('setUserToken', userToken);
}

/**
 * Track when a user clicks on a search result
 * @param {Object} hit - The search result that was clicked
 */
export function trackSearchResultClick(hit) {
  if (!hit.queryID) return;
  
  aa('clickedObjectIDsAfterSearch', {
    eventName: 'Search Result Clicked',
    index: hit.__autocomplete_indexName,
    queryID: hit.queryID,
    objectIDs: [hit.objectID],
    positions: [hit.index + 1], // algolia indexes from 1
  });
}

/**
 * Creates a search client wrapper that adds Docusaurus agent and intercepts queries
 * @param {Object} searchClient - The original Algolia search client
 * @param {string} docusaurusVersion - Version of Docusaurus
 * @param {React.MutableRefObject} queryIDRef - Ref to store the current query ID
 * @returns {Object} - Enhanced search client
 */
export function createEnhancedSearchClient(searchClient, docusaurusVersion, queryIDRef) {
  searchClient.addAlgoliaAgent('docusaurus', docusaurusVersion);
  
  // Wrap the search function to intercept responses
  const originalSearch = searchClient.search;
  searchClient.search = async (requests) => {
    const response = await originalSearch(requests);
    // Extract queryID from the response
    if (response.results?.length > 0 && response.results[0].queryID) {
      queryIDRef.current = response.results[0].queryID;
    }
    return response;
  };
  
  return searchClient;
}
