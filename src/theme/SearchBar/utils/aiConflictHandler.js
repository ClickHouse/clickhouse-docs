import { SEARCH_SHORTCUTS, INPUT_FIELD_SELECTORS } from '../searchConstants';

/**
 * Check if the active element is an input field
 * @param {Element} activeElement - The currently active DOM element
 * @returns {boolean} - True if the element is an input field
 */
function isInputField(activeElement) {
  if (!activeElement) return false;
  
  return INPUT_FIELD_SELECTORS.some(selector => {
    if (selector.startsWith('#') || selector.startsWith('[')) {
      return activeElement.matches?.(selector) || activeElement.closest?.(selector);
    }
    return activeElement.tagName === selector;
  }) || activeElement.contentEditable === 'true';
}

/**
 * Determines if search actions should be prevented when AI is open
 * @param {boolean} isAskAIOpen - Whether the AI chat is currently open
 * @returns {boolean} - True if search action should be prevented
 */
export function shouldPreventSearchAction(isAskAIOpen) {
  if (!isAskAIOpen) return false;
  
  const activeElement = document.activeElement;
  return !isInputField(activeElement);
}

/**
 * Check if the keyboard event is a search shortcut
 * @param {KeyboardEvent} event - The keyboard event
 * @returns {boolean} - True if it's a search shortcut
 */
function isSearchShortcut(event) {
  return (
    event.key === SEARCH_SHORTCUTS.SLASH ||
    (event.key === SEARCH_SHORTCUTS.CMD_K && (event.metaKey || event.ctrlKey))
  );
}

/**
 * Handles keyboard shortcuts when AI might be open
 * @param {KeyboardEvent} event - The keyboard event
 * @param {boolean} isAskAIOpen - Whether AI is open
 */
export function handleSearchKeyboardConflict(event, isAskAIOpen) {
  if (!isSearchShortcut(event)) return;

  if (shouldPreventSearchAction(isAskAIOpen)) {
    // Special case: allow "/" in input fields
    if (event.key === SEARCH_SHORTCUTS.SLASH && !shouldPreventSearchAction(isAskAIOpen)) {
      event.stopImmediatePropagation();
    } else {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
