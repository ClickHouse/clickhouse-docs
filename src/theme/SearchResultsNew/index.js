import React, { useState, useEffect, useRef } from "react"
import Link from '@docusaurus/Link'
import algoliasearch from 'algoliasearch'
import styles from "./styles.module.css"

// OK to be public: these are client-side API keys
const searchClient = algoliasearch('T28T307QNN', 'f9a28e200c69858747bad49e12b63694')
const index = searchClient.initIndex('clickhouse')

const SearchIcon = () => {
  return (
    <div className={styles.searchIcon}>
      &#9906;
    </div>
  );
};

const SearchResultsNew = ({ isModalOpen, setIsModalOpen }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [noResults, setNoResults] = useState(false)
  const modalRef = useRef(null)
  const inputRef = useRef(null)

  const hideSearchModal = () => {
    setIsModalOpen(false)
    setSearchQuery('')
  }

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value)
  }

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      hideSearchModal()
    }
  }

  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      hideSearchModal()
    }
  }

  const handleKeyDown = (event) => {
    // Check for Cmd (or Ctrl) + K
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      setIsModalOpen(true)
    }
  }

  useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('keydown', handleEscape)

      return () => {
          document.removeEventListener('mousedown', handleClickOutside)
          window.removeEventListener('keydown', handleEscape)
      }
  }, [])

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isModalOpen]);

  useEffect(() => {
      if (searchQuery) {
        index.search(searchQuery).then(({ hits }) => {
          setSearchResults(hits)
          setNoResults(!hits.length)
        })
      } else {
          setSearchResults([])
          setNoResults(false)
      }
  }, [searchQuery])

  if (!isModalOpen) return null;

  return (
    <div className={styles.searchOverlay}>
      <div className={styles.searchContainer} ref={modalRef}>
          <SearchBarInput value={searchQuery} onChange={handleInputChange} inputRef={inputRef} />
          {searchResults.length > 0 && (
            <div className={styles.resultsContainer}>
              <div className={styles.searchResultsTitle}>Results</div>
              <div className={styles.searchResultsContainer}>
                {searchResults.map((result, index) => (
                  <SearchResult
                    key={index}
                    title={result.title}
                    description={result.description}
                    breadcrumbs={result.breadcrumbs}
                    url={result.url}
                    hideSearchModal={hideSearchModal}
                  />
                ))}
              </div>
            </div>
          )}
          {noResults && (
            <div className={styles.searchResultsTitle}
                style={{paddingBottom: '10px'}}>No results found.</div>
          )}
      </div>
    </div>
  );
};

const SearchBarInput = ({ value, onChange, inputRef }) => {
  return (
    <div className={styles.searchInputContainer}>
      <SearchIcon />
      <input
        type='text'
        className={styles.searchBarInput}
        value={value}
        onChange={onChange}
        ref={inputRef}
        placeholder='Search the ClickHouse docs'
      />
    </div>
  )
}

function parseDocsURL(url) {
    if (!url.startsWith('/docs')) {
      // Check if the URL already starts with a slash to avoid double slashes
      if (url.startsWith('/')) {
        return `/docs${url}`;
      } else {
        return `/docs/${url}`;
      }
    }
    return url;
  }

const SearchResult = ({ title, description, breadcrumbs, url, hideSearchModal }) => {
  return (
    <Link className={styles.searchResult} to={parseDocsURL(url)} onClick={() => {
      parseDocsURL(url)
      hideSearchModal()
    }}>
      <div style={{
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#FDFF73',
        marginBottom: '4px'
      }}>{title}</div>
      <div style={{
        fontSize: '14px',
        marginBottom: '4px',
        color: 'white',
      }}>{description}</div>
      <div
        style={{
          fontSize: '12px',
          color: '#7F8497'
        }}
      >{breadcrumbs}</div>
    </Link>        
  )
}

export default SearchResultsNew;
