/**
 * Search-related constants and default configurations
 */

// Default search parameters
export const DEFAULT_SEARCH_PARAMS = {
  clickAnalytics: true,
  hitsPerPage: 3,
};

// Keyboard shortcuts
export const SEARCH_SHORTCUTS = {
  SLASH: '/',
  CMD_K: 'k'
};

// Kapa AI selectors and configuration
export const KAPA_CONFIG = {
  SELECTORS: {
    INPUT: '#kapa-ask-ai-input',
    CONTAINER: '#kapa-widget-container'
  },
  WIDGET_CHECK_TIMEOUT: 100, // ms to wait before checking widget availability
};

// DocSearch modal configuration
export const DOCSEARCH_CONFIG = {
  PRECONNECT_DOMAINS: {
    getAlgoliaUrl: (appId) => `https://${appId}-dsn.algolia.net`
  },
  MODAL_CONTAINER_ID: 'docsearch-modal-container',
  SCROLL_BEHAVIOR: {
    CAPTURE_INITIAL: true,
    RESTORE_ON_CLOSE: true
  }
};

// Search analytics configuration
export const ANALYTICS_CONFIG = {
  EVENT_NAMES: {
    SEARCH_RESULT_CLICKED: 'Search Result Clicked'
  },
  GA_COOKIE_NAME: '_ga',
  ALGOLIA_INDEX_OFFSET: 1 // Algolia indexes from 1, not 0
};

// URL processing configuration
export const URL_CONFIG = {
  // TODO: temporary - all search results to english for now
  FORCE_ENGLISH_RESULTS: true,
  DEFAULT_LOCALE: 'en'
};

// AI conflict detection selectors
export const INPUT_FIELD_SELECTORS = [
  'INPUT',
  'TEXTAREA',
  '#kapa-ask-ai-input',
  '#kapa-widget-container',
  '[contenteditable="true"]'
];

// Style constants
export const SEARCH_STYLES = {
  FOOTER: {
    CONTAINER: {
      padding: '12px 16px',
      borderTop: '1px solid var(--docsearch-modal-shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    AI_BUTTON: {
      BASE: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#5b4cfe',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.2s ease',
        transform: 'translateY(0)'
      },
      HOVER: {
        backgroundColor: '#4a3dcc',
        transform: 'translateY(-1px)'
      }
    },
    SEE_ALL_LINK: {
      textAlign: 'center',
      fontSize: '13px',
      color: 'var(--docsearch-muted-color)',
      textDecoration: 'none'
    }
  }
};
