import { useState, useCallback } from 'react';

// Keep these as module-level variables since they need to persist across component unmounts
let DocSearchModal = null;
let searchContainer = null;

/**
 * Custom hook to manage DocSearch modal lifecycle
 */
export function useDocSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(undefined);

  /**
   * Dynamically import DocSearch modal components if not already loaded
   */
  const importDocSearchModalIfNeeded = useCallback(() => {
    if (DocSearchModal) {
      return Promise.resolve();
    }
    return Promise.all([
      import('@docsearch/react/modal'),
      import('@docsearch/react/style'),
      import('../styles.css'),
    ]).then(([{ DocSearchModal: Modal }]) => {
      DocSearchModal = Modal;
    });
  }, []);

  /**
   * Open the search modal
   */
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
  }, [importDocSearchModalIfNeeded]);

  /**
   * Close the search modal and cleanup
   */
  const onClose = useCallback(() => {
    setIsOpen(false);
    searchContainer?.remove();
    searchContainer = null;
  }, []);

  /**
   * Handle input events that should open the modal
   */
  const onInput = useCallback((event) => {
    importDocSearchModalIfNeeded().then(() => {
      setIsOpen(true);
      setInitialQuery(event.key);
    });
  }, [importDocSearchModalIfNeeded]);

  return {
    isOpen,
    initialQuery,
    DocSearchModal,
    searchContainer,
    
    onOpen,
    onClose,
    onInput,
    setInitialQuery,
    importDocSearchModalIfNeeded,
  };
}
