import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import { DocTypeSelector } from './docTypeSelector';

function DocSearch({ contextualSearch, externalUrlRegex, ...props }) {
  const queryIDRef = useRef(null);
  const { siteMetadata, i18n: { currentLocale } } = useDocusaurusContext();
  const processSearchResultUrl = useSearchResultUrlProcessor();
  const contextualSearchFacetFilters = useAlgoliaContextualFacetFilters();
  const { isAskAIOpen, currentMode } = useAskAI();
  const history = useHistory();
  const searchButtonRef = useRef(null);
  
  // Doc type filtering state
  const [selectedDocTypes, setSelectedDocTypes] = useState(null);
  
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

  // Configure search parameters with doc_type filter
  const searchParameters = createSearchParameters(
    props, 
    contextualSearch, 
    contextualSearchFacetFilters,
    selectedDocTypes
  );

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

  const handleDocTypeChange = useCallback((docTypes) => {
    setSelectedDocTypes(docTypes);
  }, []);

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
                <>               
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
                  />
                  
                  {/* Selector positioned as overlay */}
                  <div style={{
                    position: 'fixed',
                    top: '120px', // Much closer to search bar area
                    right: 'calc(50% - 280px)', // Position relative to modal right edge
                    zIndex: 10000,
                    backgroundColor: 'var(--docsearch-modal-background)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--docsearch-modal-shadow)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <DocTypeSelector 
                      selectedDocTypes={selectedDocTypes}
                      onSelectionChange={handleDocTypeChange}
                    />
                  </div>
                </>,
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