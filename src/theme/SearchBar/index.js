import React, { useCallback, useMemo, useRef } from 'react';
import { DocSearchButton, useDocSearchKeyboardEvents } from '@docsearch/react';
import Head from '@docusaurus/Head';
import { useHistory } from '@docusaurus/router';
import {
  useAlgoliaContextualFacetFilters,
  useSearchResultUrlProcessor,
} from '@docusaurus/theme-search-algolia/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createPortal } from 'react-dom';
import translations from '@theme/SearchTranslations';
import { useEffect } from 'react';
import {useAskAI} from '@site/src/hooks/useAskAI'
import { shouldPreventSearchAction, handleSearchKeyboardConflict } from './utils/aiConflictHandler';
import { initializeSearchAnalytics, createEnhancedSearchClient } from './utils/searchAnalytics';
import { useDocSearchModal } from './utils/useDocSearchModal';
import { 
  createSearchParameters, 
  createSearchNavigator, 
  transformSearchItems 
} from './utils/searchConfig';
import { SearchHit } from './searchHit';
import { SearchResultsFooter } from './searchResultsFooter';

function DocSearch({ contextualSearch, externalUrlRegex, ...props }) {
  const queryIDRef = useRef(null);
  const { siteMetadata, i18n: { currentLocale } } = useDocusaurusContext();
  const processSearchResultUrl = useSearchResultUrlProcessor();
  const contextualSearchFacetFilters = useAlgoliaContextualFacetFilters();
  const configFacetFilters = props.searchParameters?.facetFilters ?? [];
  const facetFilters = contextualSearch
      ? // Merge contextual search filters with config filters
      mergeFacetFilters(contextualSearchFacetFilters, configFacetFilters)
      : // ... or use config facetFilters
      configFacetFilters;
  // We add clickAnalyics here
  const searchParameters = {
    ...props.searchParameters,
    facetFilters,
    clickAnalytics: true,
    hitsPerPage: 10,
  };
  const { isAskAIOpen, currentMode } = useAskAI();
  const history = useHistory();
  const searchButtonRef = useRef(null);
  
  // Use the modal management hook
  const {
    isOpen,
    initialQuery,
    DocSearchModal,
    searchContainer,
    onOpen,
    onClose,
    onInput,
    importDocSearchModalIfNeeded
  } = useDocSearchModal();

  // Configure search parameters
  const searchParameters = createSearchParameters(props, contextualSearch, contextualSearchFacetFilters);

  useEffect(() => {
    initializeSearchAnalytics(props.appId, props.apiKey);
  }, [props.appId, props.apiKey]);

  // Create navigator for handling result clicks
  const navigator = useMemo(
    () => createSearchNavigator(history, externalUrlRegex),
    [history, externalUrlRegex]
  );

  // Transform search items with metadata
  const transformItems = useCallback((items, state) => {
    return transformSearchItems(items, {
      transformItems: props.transformItems,
      processSearchResultUrl,
      currentLocale,
      queryIDRef
    });
  }, [props.transformItems, processSearchResultUrl, currentLocale]);

  const resultsFooterComponent = useMemo(
    () =>
      // eslint-disable-next-line react/no-unstable-nested-components
      (footerProps) =>
        <SearchResultsFooter {...footerProps} onClose={onClose} />,
    [onClose],
  );

  const transformSearchClient = useCallback((searchClient) => {
    return createEnhancedSearchClient(searchClient, siteMetadata.docusaurusVersion, queryIDRef);
  }, [siteMetadata.docusaurusVersion]);

  const handleOnOpen = useCallback(() => {
    console.log('handleOnOpen called', { isAskAIOpen });
    
    if (shouldPreventSearchAction(isAskAIOpen)) {
      console.log('handleOnOpen - preventing search modal');
      return;
    }
    
    onOpen();
  }, [isAskAIOpen, onOpen]);

  const handleOnInput = useCallback((event) => {
    if (shouldPreventSearchAction(isAskAIOpen)) {
      return; // Prevent search input handling
    }
    onInput(event);
  }, [isAskAIOpen, onInput]);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: handleOnOpen,
    onClose,
    onInput: handleOnInput,
    searchButtonRef,
  });
  
  return (
      <>
        <Head>
          {/* This hints the browser that the website will load data from Algolia,
        and allows it to preconnect to the DocSearch cluster. It makes the first
        query faster, especially on mobile. */}
          <link
              rel="preconnect"
              href={`https://${props.appId}-dsn.algolia.net`}
              crossOrigin="anonymous"
          />
        </Head>

        <DocSearchButton
            onTouchStart={importDocSearchModalIfNeeded}
            onFocus={importDocSearchModalIfNeeded}
            onMouseOver={importDocSearchModalIfNeeded}
            onClick={onOpen}
            ref={searchButtonRef}
            translations={translations.button}
        />

        {isOpen &&
            DocSearchModal &&
            searchContainer &&
            createPortal(
                <DocSearchModal
                    onClose={onClose}
                    initialScrollY={window.scrollY}
                    initialQuery={initialQuery}
                    navigator={navigator}
                    transformItems={transformItems}
                    hitComponent={SearchHit}
                    transformSearchClient={transformSearchClient}
                    {...(props.searchPagePath && {
                      resultsFooterComponent,
                    })}
                    {...props}
                    insights={true}
                    searchParameters={searchParameters}
                    placeholder={translations.placeholder}
                    translations={translations.modal}
                />,
                searchContainer,
            )}
      </>
  );
}

export default function SearchBar() {
  const { siteConfig } = useDocusaurusContext();
  const { isAskAIOpen } = useAskAI();

  useEffect(() => {
    const handleKeyDown = (event) => {
      handleSearchKeyboardConflict(event, isAskAIOpen);
    };

    // Add listener with capture phase to intercept before DocSearch
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isAskAIOpen]);

  return <DocSearch {...siteConfig.themeConfig.algolia} />;
}