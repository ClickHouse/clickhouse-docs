import React, { useState, useEffect } from "react"
import { useColorMode } from '@docusaurus/theme-common';
import styles from "./styles.module.css"
import SearchResultsNew from '@theme/SearchResultsNew';

export default function SearchBarNew() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { colorMode } = useColorMode()

  const handleOpenSearchShortcut = (event) => {
    // Check for Cmd (or Ctrl) + K
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      setIsModalOpen(true)
    }
  }

  useEffect(() => {
      window.addEventListener('keydown', handleOpenSearchShortcut)

      return () => {
          window.removeEventListener('keydown', handleOpenSearchShortcut)
      }
  }, [])

  return <>
    <div className={styles.searchInputContainer}
       style={{
        borderColor: colorMode === 'dark' ? 'var(--click-color-stroke)' : 'rgb(230, 231, 233)'
      }}
      onClick={() => {
        setIsModalOpen(true)
      }}>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <div style={{marginTop: '2px'}}>
          <svg width="20" height="20" class="DocSearch-Search-Icon"
          viewBox="0 0 20 20">
            <path d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z" stroke="gray" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        </div>
        <div className={styles.searchInputPlaceholder}>Search</div>
      </div>
      <div className={styles.searchInputShortcut} style={{
        borderColor: colorMode === 'dark' ? 'var(--click-color-stroke)' : 'rgb(230, 231, 233)',
        backgroundColor: colorMode === 'dark' ?
          'var(--palette_neutral_650)' : 'rgb(230, 231, 233)'
      }}>⌘ + K</div>
    </div>
    <SearchResultsNew isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
  </>
}
