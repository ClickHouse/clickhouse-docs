import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useDocSearchKeyboardEvents } from '@docsearch/react';
import Head from '@docusaurus/Head';
import { useHistory } from '@docusaurus/router';
import {
  useAlgoliaContextualFacetFilters,
  useSearchResultUrlProcessor,
} from '@docusaurus/theme-search-algolia/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createPortal } from 'react-dom';
import translations from '@theme/SearchTranslations';
import { useAskAI } from '@site/src/hooks/useAskAI'
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

/**
 * Progressive enhancement search button.
 * Before React hydrates: clicking navigates to the search page (works without JS).
 * After React hydrates: clicking opens the DocSearch modal.
 */
function ProgressiveSearchButton({ onClick, onMouseOver, onFocus, onTouchStart, searchPagePath, buttonRef }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleClick = useCallback((e) => {
    // After hydration, prevent navigation and use the modal instead
    if (isHydrated) {
      e.preventDefault();
      onClick?.();
    }
    // Before hydration, the link naturally navigates to the search page
  }, [isHydrated, onClick]);

  // Detect OS for keyboard shortcut display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  return (
    <a
      href={searchPagePath}
      ref={buttonRef}
      className="DocSearch DocSearch-Button"
      aria-label={translations.button?.buttonAriaLabel || 'Search'}
      onClick={handleClick}
      onMouseOver={onMouseOver}
      onFocus={onFocus}
      onTouchStart={onTouchStart}
    >
      <span className="DocSearch-Button-Container">
        <svg
          width="20"
          height="20"
          className="DocSearch-Search-Icon"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
            stroke="currentColor"
            fill="none"
            fillRule="evenodd"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="DocSearch-Button-Placeholder">
          {translations.button?.buttonText || 'Search'}
        </span>
      </span>
      <span className="DocSearch-Button-Keys">
        <kbd className="DocSearch-Button-Key">{shortcutKey}</kbd>
        <kbd className="DocSearch-Button-Key">K</kbd>
      </span>
    </a>
  );
}

function DocSearch({ contextualSearch, externalUrlRegex, ...props }) {
  const queryIDRef = useRef(null);
  const lastQueryRef = useRef('');
  const { siteMetadata, i18n: { currentLocale } } = useDocusaurusContext();
  const processSearchResultUrl = useSearchResultUrlProcessor();
  const contextualSearchFacetFilters = useAlgoliaContextualFacetFilters();
  const { isAskAIOpen } = useAskAI();
  const history = useHistory();
  const searchButtonRef = useRef(null);

  const [selectedDocTypes, setSelectedDocTypes] = useState(null);
  const searchParametersRef = useRef(null);

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

  // Update searchParameters ref instead of creating new object
  useEffect(() => {
    const newParams = createSearchParameters(
      props,
      contextualSearch,
      contextualSearchFacetFilters,
      selectedDocTypes
    );

    if (!searchParametersRef.current) {
      searchParametersRef.current = newParams;
    } else {
      Object.keys(newParams).forEach(key => {
        searchParametersRef.current[key] = newParams[key];
      });
    }
  }, [props, contextualSearch, contextualSearchFacetFilters, selectedDocTypes]);

  // Initialize on mount
  if (!searchParametersRef.current) {
    searchParametersRef.current = createSearchParameters(
      props,
      contextualSearch,
      contextualSearchFacetFilters,
      selectedDocTypes
    );
  }

  // Track input changes to capture the query
  useEffect(() => {
    if (!isOpen) return;

    const handleInput = (e) => {
      const input = e.target;
      if (input.classList.contains('DocSearch-Input')) {
        lastQueryRef.current = input.value;
      }
    };

    document.addEventListener('input', handleInput, true);
    return () => document.removeEventListener('input', handleInput, true);
  }, [isOpen]);

  useEffect(() => {
    initializeSearchAnalytics(props.appId, props.apiKey);
  }, [props.appId, props.apiKey]);

  const navigator = useMemo(
    () => createSearchNavigator(history, externalUrlRegex, currentLocale),
    [history, externalUrlRegex, currentLocale]
  );

  const transformItems = useCallback((items, state) => {
    if (state?.query) {
      lastQueryRef.current = state.query;
    }

    return transformSearchItems(items, {
      transformItems: props.transformItems,
      processSearchResultUrl,
      currentLocale,
      queryIDRef
    });
  }, [props.transformItems, processSearchResultUrl, currentLocale]);

  const handleDocTypeChange = useCallback((docTypes) => {
    setSelectedDocTypes(docTypes);

    // Re-trigger search with updated filters after state update completes
    setTimeout(() => {
      const input = document.querySelector('.DocSearch-Input');
      const query = lastQueryRef.current;

      if (input && query) {
        // Access React's internal value setter to bypass readonly property
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;

        // Clear input to trigger change detection
        nativeInputValueSetter.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));

        // Restore original query to execute search with new filters
        setTimeout(() => {
          nativeInputValueSetter.call(input, query);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }, 0);
      }
    }, 100);
  }, []);

  const resultsFooterComponent = useMemo(
    () => (footerProps) => <SearchResultsFooter {...footerProps} onClose={onClose} />,
    [onClose]
  );

  const transformSearchClient = useCallback((searchClient) => {
    const enhancedClient = createEnhancedSearchClient(
      searchClient,
      siteMetadata.docusaurusVersion,
      queryIDRef
    );

    const originalSearch = enhancedClient.search.bind(enhancedClient);

    let debounceTimeout;
    enhancedClient.search = (...args) => {
      return new Promise((resolve, reject) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          originalSearch(...args)
            .then(resolve)
            .catch(reject);
        }, 200);
      });
    };

    return enhancedClient;
  }, [siteMetadata.docusaurusVersion]);

  const handleOnOpen = useCallback(() => {
    if (shouldPreventSearchAction(isAskAIOpen)) {
      return;
    }
    onOpen();
  }, [isAskAIOpen, onOpen]);

  const handleOnInput = useCallback((event) => {
    if (shouldPreventSearchAction(isAskAIOpen)) {
      return;
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
        <link
          rel="preconnect"
          href={`https://${props.appId}-dsn.algolia.net`}
          crossOrigin="anonymous"
        />
      </Head>

      <ProgressiveSearchButton
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}
        onClick={handleOnOpen}
        buttonRef={searchButtonRef}
        searchPagePath={props.searchPagePath || '/docs/search'}
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
              searchParameters={searchParametersRef.current}
              placeholder={translations.placeholder}
              translations={translations.modal}
            />
          </>,
          searchContainer
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

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isAskAIOpen]);

  return <DocSearch {...siteConfig.themeConfig.algolia} />;
}
