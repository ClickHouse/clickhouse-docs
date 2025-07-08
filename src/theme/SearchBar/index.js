import React, { useCallback, useMemo, useRef, useState } from 'react';
import { DocSearchButton, useDocSearchKeyboardEvents } from '@docsearch/react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import { isRegexpStringMatch, useSearchLinkCreator } from '@docusaurus/theme-common';
import {
  useAlgoliaContextualFacetFilters,
  useSearchResultUrlProcessor,
} from '@docusaurus/theme-search-algolia/client';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { createPortal } from 'react-dom';
import translations from '@theme/SearchTranslations';
import aa from 'search-insights';
import { useEffect } from 'react';
import { getGoogleAnalyticsUserIdFromBrowserCookie } from '../../lib/google/google'
import {useAskAI} from '@site/src/hooks/useAskAI'

let DocSearchModal = null;
let searchContainer = null;

function Hit({ hit, children }) {
  const handleClick = () => {
    if (hit.queryID) {
      aa('clickedObjectIDsAfterSearch', {
        eventName: 'Search Result Clicked',
        index: hit.__autocomplete_indexName,
        queryID: hit.queryID,
        objectIDs: [hit.objectID],
        positions: [hit.index + 1], // algolia indexes from 1
      });
    }
  };
  return <Link onClick={handleClick} to={hit.url}>{children}</Link>;
}

function ResultsFooter({ state, onClose }) {
  const generateSearchPageLink = useSearchLinkCreator();
  return (
      <Link to={generateSearchPageLink(state.query)} onClick={onClose}>
        <Translate
            id="theme.SearchBar.seeAll"
            values={{ count: state.context.nbHits }}>
          {'See all {count} results'}
        </Translate>
      </Link>
  );
}

function mergeFacetFilters(f1, f2) {
  const normalize = (f) => (typeof f === 'string' ? [f] : f);
  return [...normalize(f1), ...normalize(f2)];
}

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
  };
  const { isAskAIOpen, currentMode } = useAskAI();
  const history = useHistory();
  const searchButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userToken = getGoogleAnalyticsUserIdFromBrowserCookie('_ga');
      aa('init', {
        appId: props.appId,
        apiKey: props.apiKey,
      });
      aa('setUserToken', userToken);
    }
  }, [props.appId, props.apiKey]);

  const importDocSearchModalIfNeeded = useCallback(() => {
    if (DocSearchModal) {
      return Promise.resolve();
    }
    return Promise.all([
      import('@docsearch/react/modal'),
      import('@docsearch/react/style'),
      import('./styles.css'),
    ]).then(([{ DocSearchModal: Modal }]) => {
      DocSearchModal = Modal;
    });
  }, []);

  const onOpen = useCallback(() => {
    importDocSearchModalIfNeeded().then(() => {
      // searchContainer is not null here when the modal is already open
      // this check is needed because ctrl + k shortcut was handled by another instance of SearchBar component
      if (searchContainer) {
        return;
      }

      searchContainer = document.createElement('div');
      document.body.insertBefore(
          searchContainer,
          document.body.firstChild,
      );

      setIsOpen(true);
    });
  }, [importDocSearchModalIfNeeded, setIsOpen]);

  const onClose = useCallback(() => {
    setIsOpen(false);
    searchContainer?.remove();
    searchContainer = null;;
  }, [setIsOpen]);

  const onInput = useCallback(
      (event) => {
        importDocSearchModalIfNeeded().then(() => {
          setIsOpen(true);
          setInitialQuery(event.key);
        });
      },
      [importDocSearchModalIfNeeded, setIsOpen, setInitialQuery],
  );

  const navigator = useRef({
    navigate({ itemUrl }) {
      // Algolia results could contain URL's from other domains which cannot
      // be served through history and should navigate with window.location
      if (isRegexpStringMatch(externalUrlRegex, itemUrl)) {
        window.location.href = itemUrl;
      } else {
        history.push(itemUrl);
      }
    },
  }).current;

  const transformItems = useRef((items, state) => {
    return props.transformItems
        ? props.transformItems(items)
        : items.map((item, index) => {
          return {
            ...item,
            url: currentLocale == 'en' ? processSearchResultUrl(item.url) : item.url, //TODO: temporary - all search results to english for now
            // url: processSearchResultUrl(item.url),
            index, // Adding the index property - needed for click metrics
            queryID: queryIDRef.current
          };
        });
  }).current;

  const resultsFooterComponent = useMemo(
      () =>
          // eslint-disable-next-line react/no-unstable-nested-components
          (footerProps) =>
              <ResultsFooter {...footerProps} onClose={onClose} />,
      [onClose],
  );

  const transformSearchClient = useCallback((searchClient) => {
    searchClient.addAlgoliaAgent('docusaurus', siteMetadata.docusaurusVersion);
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
  }, [siteMetadata.docusaurusVersion]);

  const handleOnOpen = useCallback(() => {
    console.log('handleOnOpen called', { isAskAIOpen });
    // Only prevent opening if Kapa is open AND user is not in an input field
    if (isAskAIOpen) {
      const activeElement = document.activeElement;
      const isInInputField = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.id === 'kapa-widget-container' ||
          activeElement.contentEditable === 'true' ||
          activeElement.closest('[contenteditable="true"]') ||
          activeElement.closest('#kapa-widget-container')
      );

      console.log('handleOnOpen - in input field:', isInInputField);
      if (!isInInputField) {
        console.log('handleOnOpen - preventing search modal');
        return; // Prevent search from opening
      }
    }
    onOpen();
  }, [isAskAIOpen, onOpen]);

  const handleOnInput = useCallback((event) => {
    // Only prevent input handling if Kapa is open AND user is not in an input field
    if (isAskAIOpen) {
      const activeElement = document.activeElement;

      // Check for input fields, with specific check for Kapa's textarea
      const isInInputField = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.id === 'kapa-ask-ai-input' ||
          activeElement.id === 'kapa-widget-container' ||
          activeElement.closest('#kapa-widget-container')
      );

      if (!isInInputField) {
        return; // Prevent search input handling
      }

      // If we're in an input field, allow normal typing but don't open search modal
      return;
    }
    onInput(event);
  }, [isAskAIOpen, onInput]);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: handleOnOpen,  // Use the new callback
    onClose,
    onInput: handleOnInput, // Use the new callback
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
                    hitComponent={Hit}
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
      // Check for "/" key or Cmd/Ctrl+K
      const isSearchShortcut = (
          event.key === '/' ||
          (event.key === 'k' && (event.metaKey || event.ctrlKey))
      );

      if (isSearchShortcut) {
        if (isAskAIOpen) {
          const activeElement = document.activeElement;

          const isInInputField = activeElement && (
              activeElement.tagName === 'INPUT' ||
              activeElement.tagName === 'TEXTAREA' ||
              activeElement.id === 'kapa-ask-ai-input' ||
              activeElement.id === 'kapa-widget-container' ||
              activeElement.contentEditable === 'true' ||
              activeElement.closest('[contenteditable="true"]') ||
              activeElement.closest('#kapa-widget-container')
          );

          if (isInInputField && event.key === '/') {
            event.stopImmediatePropagation();
          } else {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }
      }
    };

    // Add listener with capture phase to intercept before DocSearch
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isAskAIOpen]);

  return <DocSearch {...siteConfig.themeConfig.algolia} />;
}