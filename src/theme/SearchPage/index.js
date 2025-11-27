/* eslint-disable jsx-a11y/no-autofocus */
import React, { useEffect, useReducer, useRef, useState } from 'react';
import clsx from 'clsx';
import algoliaSearchHelper from 'algoliasearch-helper';
import { liteClient } from 'algoliasearch/lite';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import { useAllDocsData } from '@docusaurus/plugin-content-docs/client';
import {
  HtmlClassNameProvider,
  useEvent,
  usePluralForm,
  useSearchQueryString,
} from '@docusaurus/theme-common';
import { useTitleFormatter } from '@docusaurus/theme-common/internal';
import Translate, { translate } from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {
  useAlgoliaThemeConfig,
  useSearchResultUrlProcessor,
} from '@docusaurus/theme-search-algolia/client';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

// Very simple pluralization: probably good enough for now
function useDocumentsFoundPlural() {
  const { selectMessage } = usePluralForm();
  return (count) =>
    selectMessage(
      count,
      translate(
        {
          id: 'theme.SearchPage.documentsFound.plurals',
          description:
            'Pluralized label for "{count} documents found". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',
          message: 'One document found|{count} documents found',
        },
        { count },
      ),
    );
}

function useDocsSearchVersionsHelpers() {
  const allDocsData = useAllDocsData();
  // State of the version select menus / algolia facet filters
  // docsPluginId -> versionName map
  const [searchVersions, setSearchVersions] = useState(() =>
    Object.entries(allDocsData).reduce(
      (acc, [pluginId, pluginData]) => ({
        ...acc,
        [pluginId]: pluginData.versions[0].name,
      }),
      {},
    ),
  );
  // Set the value of a single select menu
  const setSearchVersion = (pluginId, searchVersion) =>
    setSearchVersions((s) => ({ ...s, [pluginId]: searchVersion }));
  const versioningEnabled = Object.values(allDocsData).some(
    (docsData) => docsData.versions.length > 1,
  );
  return {
    allDocsData,
    versioningEnabled,
    searchVersions,
    setSearchVersion,
  };
}

// We want to display one select per versioned docs plugin instance
function SearchVersionSelectList({ docsSearchVersionsHelpers }) {
  const versionedPluginEntries = Object.entries(
    docsSearchVersionsHelpers.allDocsData,
  )
    // Do not show a version select for unversioned docs plugin instances
    .filter(([, docsData]) => docsData.versions.length > 1);
  return (
    <div
      className={clsx(
        'col',
        'col--3',
        'padding-left--none',
        styles.searchVersionColumn,
      )}>
      {versionedPluginEntries.map(([pluginId, docsData]) => {
        const labelPrefix =
          versionedPluginEntries.length > 1 ? `${pluginId}: ` : '';
        return (
          <select
            key={pluginId}
            onChange={(e) =>
              docsSearchVersionsHelpers.setSearchVersion(
                pluginId,
                e.target.value,
              )
            }
            defaultValue={docsSearchVersionsHelpers.searchVersions[pluginId]}
            className={styles.searchVersionInput}>
            {docsData.versions.map((version, i) => (
              <option
                key={i}
                label={`${labelPrefix}${version.label}`}
                value={version.name}
              />
            ))}
          </select>
        );
      })}
    </div>
  );
}

function SearchPageContent() {
  const {
    i18n: { currentLocale },
  } = useDocusaurusContext();
  const {
    algolia: { appId, apiKey, indexName, contextualSearch },
  } = useAlgoliaThemeConfig();
  const processSearchResultUrl = useSearchResultUrlProcessor();
  const documentsFoundPlural = useDocumentsFoundPlural();
  const docsSearchVersionsHelpers = useDocsSearchVersionsHelpers();
  const [searchQuery, setSearchQuery] = useSearchQueryString();
  const initialSearchResultState = {
    items: [],
    query: null,
    totalResults: null,
    totalPages: null,
    lastPage: null,
    hasMore: null,
    loading: null,
  };
  const [searchResultState, searchResultStateDispatcher] = useReducer(
    (prevState, data) => {
      switch (data.type) {
        case 'reset': {
          return initialSearchResultState;
        }
        case 'loading': {
          return { ...prevState, loading: true };
        }
        case 'update': {
          if (searchQuery !== data.value.query) {
            return prevState;
          }
          return {
            ...data.value,
            items:
              data.value.lastPage === 0
                ? data.value.items
                : prevState.items.concat(data.value.items),
          };
        }
        case 'advance': {
          const hasMore = prevState.totalPages > prevState.lastPage + 1;
          return {
            ...prevState,
            lastPage: hasMore ? prevState.lastPage + 1 : prevState.lastPage,
            hasMore,
          };
        }
        default:
          return prevState;
      }
    },
    initialSearchResultState,
  );
  // respect settings from the theme config for facets
  const disjunctiveFacets = contextualSearch
    ? ['language', 'docusaurus_tag']
    : [];
  const algoliaClient = liteClient(appId, apiKey);
  const algoliaHelper = algoliaSearchHelper(algoliaClient, indexName, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: why errors happens after upgrading to TS 5.5 ?
    hitsPerPage: 15,
    advancedSyntax: true,
    disjunctiveFacets,
    clickAnalytics: true,
  });
  algoliaHelper.on(
    'result',
    ({ results: { query, params, hits, page, nbHits, nbPages } }) => {
      // Parse the `params` string to extract all `query` values
      const urlSearchParams = new URLSearchParams(params);
      const queries = urlSearchParams.getAll('query'); // Extract all `query` parameters

      // `queries` will contain an array of query terms (e.g., ["engines", "table engines"])
      const originalQuery = queries.length > 1 ? queries[0] : query; // First query is the original
      const overriddenQuery = query; // Final query processed by Algolia

      if (query === '' || !Array.isArray(hits)) {
        searchResultStateDispatcher({ type: 'reset' });
        return;
      }

      const sanitizeValue = (value) =>
        value.replace(
          /algolia-docsearch-suggestion--highlight/g,
          'search-result-match',
        );

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

      const items = hits.map(
        ({
          url,
          _highlightResult: { hierarchy },
          _snippetResult: snippet = {},
        }) => {
          const titles = Object.keys(hierarchy).map((key) =>
            sanitizeValue(hierarchy[key].value),
          );
          return {
            title: titles.pop(),
            url: transformUrl(url, currentLocale),
            summary: snippet.content
              ? `${sanitizeValue(snippet.content.value)}...`
              : '',
            breadcrumbs: titles,
          };
        },
      );

      searchResultStateDispatcher({
        type: 'update',
        value: {
          items,
          query: originalQuery, // Use the overridden query here or we don't get an update
          overriddenQuery, // Store the original query for debugging or display
          totalResults: nbHits,
          totalPages: nbPages,
          lastPage: page,
          hasMore: nbPages > page + 1,
          loading: false,
        },
      });
    },
  );

  const [loaderRef, setLoaderRef] = useState(null);
  const prevY = useRef(0);
  const observer = useRef(
    ExecutionEnvironment.canUseIntersectionObserver &&
    new IntersectionObserver(
      (entries) => {
        const {
          isIntersecting,
          boundingClientRect: { y: currentY },
        } = entries[0];
        if (isIntersecting && prevY.current > currentY) {
          searchResultStateDispatcher({ type: 'advance' });
        }
        prevY.current = currentY;
      },
      { threshold: 1 },
    ),
  );
  const getTitle = () =>
    searchQuery
      ? translate(
        {
          id: 'theme.SearchPage.existingResultsTitle',
          message: 'Search results for "{query}"',
          description: 'The search page title for non-empty query',
        },
        {
          query: searchQuery,
        },
      )
      : translate({
        id: 'theme.SearchPage.emptyResultsTitle',
        message: 'Search the documentation',
        description: 'The search page title for empty query',
      });

  const makeSearch = useEvent((page = 0) => {
    if (contextualSearch) {
      algoliaHelper.addDisjunctiveFacetRefinement('docusaurus_tag', 'default');
      algoliaHelper.addDisjunctiveFacetRefinement('language', currentLocale);
      Object.entries(docsSearchVersionsHelpers.searchVersions).forEach(
        ([pluginId, searchVersion]) => {
          algoliaHelper.addDisjunctiveFacetRefinement(
            'docusaurus_tag',
            `docs-${pluginId}-${searchVersion}`,
          );
        },
      );
    }
    algoliaHelper.setQuery(searchQuery).setPage(page).search();
  });

  useEffect(() => {
    if (!loaderRef) {
      return undefined;
    }
    const currentObserver = observer.current;
    if (currentObserver) {
      currentObserver.observe(loaderRef);
      return () => currentObserver.unobserve(loaderRef);
    }
    return () => true;
  }, [loaderRef]);
  useEffect(() => {
    searchResultStateDispatcher({ type: 'reset' });
    if (searchQuery) {
      searchResultStateDispatcher({ type: 'loading' });
      setTimeout(() => {
        makeSearch();
      }, 300);
    }
  }, [searchQuery, docsSearchVersionsHelpers.searchVersions, makeSearch]);
  useEffect(() => {
    if (!searchResultState.lastPage || searchResultState.lastPage === 0) {
      return;
    }
    makeSearch(searchResultState.lastPage);
  }, [makeSearch, searchResultState.lastPage]);
  return (
    <Layout>
      <Head>
        <title>{useTitleFormatter(getTitle())}</title>
        {/*
         We should not index search pages
          See https://github.com/facebook/docusaurus/pull/3233
        */}
        <meta property="robots" content="noindex, follow" />
      </Head>

      <div className="container margin-vert--lg">
        <Heading as="h1">{getTitle()}</Heading>

        <form className="row" onSubmit={(e) => e.preventDefault()}>
          <div
            className={clsx('col', styles.searchQueryColumn, {
              'col--9': docsSearchVersionsHelpers.versioningEnabled,
              'col--12': !docsSearchVersionsHelpers.versioningEnabled,
            })}>
            <input
              type="search"
              name="q"
              className={styles.searchQueryInput}
              placeholder={translate({
                id: 'theme.SearchPage.inputPlaceholder',
                message: 'Type your search here',
                description: 'The placeholder for search page input',
              })}
              aria-label={translate({
                id: 'theme.SearchPage.inputLabel',
                message: 'Search',
                description: 'The ARIA label for search page input',
              })}
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              autoComplete="off"
              autoFocus
            />
          </div>

          {contextualSearch && docsSearchVersionsHelpers.versioningEnabled && (
            <SearchVersionSelectList
              docsSearchVersionsHelpers={docsSearchVersionsHelpers}
            />
          )}
        </form>

        <div className="row">
          <div className={clsx('col', 'col--8', styles.searchResultsColumn)}>
            {!!searchResultState.totalResults &&
              documentsFoundPlural(searchResultState.totalResults)}
          </div>

        </div>

        {searchResultState.items.length > 0 ? (
          <main>
            {searchResultState.items.map(
              ({ title, url, summary, breadcrumbs }, i) => (
                < article key={i} className={styles.searchResultItem} >
                  <Heading as="h2" className={styles.searchResultItemHeading}>
                    <Link to={url} dangerouslySetInnerHTML={{ __html: title }} />
                  </Heading>

                  {
                    breadcrumbs.length > 0 && (
                      <nav aria-label="breadcrumbs">
                        <ul
                          className={clsx(
                            'breadcrumbs',
                            styles.searchResultItemPath,
                          )}>
                          {breadcrumbs.map((html, index) => (
                            <li
                              key={index}
                              className="breadcrumbs__item"
                              // Developer provided the HTML, so assume it's safe.
                              // eslint-disable-next-line react/no-danger
                              dangerouslySetInnerHTML={{ __html: html }}
                            />
                          ))}
                        </ul>
                      </nav>
                    )
                  }

                  {summary && (
                    <p
                      className={styles.searchResultItemSummary}
                      // Developer provided the HTML, so assume it's safe.
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: summary }}
                    />
                  )}
                </article>
              ),
            )}
          </main>
        ) : (
          [
            searchQuery && !searchResultState.loading && (
              <p key="no-results">
                <Translate
                  id="theme.SearchPage.noResultsText"
                  description="The paragraph for empty search result">
                  No results were found
                </Translate>
              </p>
            ),
            !!searchResultState.loading && (
              <div key="spinner" className={styles.loadingSpinner} />
            ),
          ]
        )}

        {searchResultState.hasMore && (
          <div className={styles.loader} ref={setLoaderRef}>
            <Translate
              id="theme.SearchPage.fetchingNewResults"
              description="The paragraph for fetching new search results">
              Fetching new results...
            </Translate>
          </div>
        )}
      </div>
    </Layout >
  );
}
export default function SearchPage() {
  return (
    <HtmlClassNameProvider className="search-page-wrapper">
      <SearchPageContent />
    </HtmlClassNameProvider>
  );
}
