import React, { useCallback } from 'react';
import Link from '@docusaurus/Link';
import { useSearchLinkCreator } from '@docusaurus/theme-common';
import Translate from '@docusaurus/Translate';
import { SEARCH_STYLES } from './searchConstants';

/**
 * Footer component for search results with AI integration and "see all" link
 * @param {Object} state - Current search state
 * @param {Function} onClose - Function to close the search modal
 */
export function SearchResultsFooter({ state, onClose }) {
  const generateSearchPageLink = useSearchLinkCreator();

  const handleKapaClick = useCallback(() => {
    onClose(); // Close search modal first
    
    // Use Kapa's official API to open with query
    if (typeof window !== 'undefined' && window.Kapa) {
      window.Kapa('open', { 
        query: state.query || '',
        submit: !!state.query 
      });
    } else {
      console.warn('Kapa widget not loaded');
    }
  }, [state.query, onClose]);

  return (
    <div style={SEARCH_STYLES.FOOTER.CONTAINER}>
      {/* Kapa AI Button */}
      <button 
        onClick={handleKapaClick}
        style={SEARCH_STYLES.FOOTER.AI_BUTTON.BASE}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = SEARCH_STYLES.FOOTER.AI_BUTTON.HOVER.backgroundColor;
          e.target.style.transform = SEARCH_STYLES.FOOTER.AI_BUTTON.HOVER.transform;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = SEARCH_STYLES.FOOTER.AI_BUTTON.BASE.backgroundColor;
          e.target.style.transform = SEARCH_STYLES.FOOTER.AI_BUTTON.BASE.transform;
        }}
      >
        🤖 Ask AI{state.query ? ` about "${state.query}"` : ''}
      </button>
      
      {/* Original "See all results" link */}
      <Link 
        to={generateSearchPageLink(state.query)} 
        onClick={onClose}
        style={SEARCH_STYLES.FOOTER.SEE_ALL_LINK}
      >
        <Translate
          id="theme.SearchBar.seeAll"
          values={{ count: state.context.nbHits }}
        >
          {'See all {count} results'}
        </Translate>
      </Link>
    </div>
  );
}
