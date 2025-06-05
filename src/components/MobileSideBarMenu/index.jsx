import React, {useState, useEffect, useRef} from 'react';
import Hamburger from "./Hamburger";
import MobileSideBarMenuContents from './Content';
import styles from './styles.module.scss';
import { useLocation, useHistory } from '@docusaurus/router';

const MobileSideBarMenu = ({sidebar, menu}) => {
    const [currentMenuState, setMenuState] = useState(() => {
        // Try to restore menu state from sessionStorage on mount
        const savedMenuState = sessionStorage.getItem('mobilemenu_open');
        return savedMenuState === 'true';
    });
    const location = useLocation();
    const history = useHistory();
    const previousLocationRef = useRef(null);
    const isLanguageChangeRef = useRef(false);
    const languageChangeTimeoutRef = useRef(null);

    // Save menu state to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('mobilemenu_open', currentMenuState.toString());
    }, [currentMenuState]);

    // Define the breakpoint where mobile menu should be hidden (laptop breakpoint)
    const LAPTOP_BREAKPOINT = 1330;

    // Initialize the previous location ref on first render and monitor location changes
    useEffect(() => {
        const currentPath = location.pathname;
        const previousPath = previousLocationRef.current;

        // On first render, check if we can get previous path from sessionStorage
        if (previousPath === null) {
            const storedPreviousPath = sessionStorage.getItem('mobilemenu_previous_path');

            if (storedPreviousPath && storedPreviousPath !== currentPath) {
                // We have a stored previous path that's different from current
                previousLocationRef.current = storedPreviousPath;
                // Continue with path change detection below
            } else {
                // No stored path or it's the same - initialize and skip detection
                previousLocationRef.current = currentPath;
                sessionStorage.setItem('mobilemenu_previous_path', currentPath);
                return; // Skip path change detection on first render
            }
        }

        // Check if this is a language change (same base path, different locale)
        const isLanguageChange = () => {
            // More comprehensive language change detection
            const normalizePathForComparison = (path) => {
                // Handle docs root cases first
                if (path === '/docs' || path === '/docs/') {
                    return '/docs/';
                }
                if (path.match(/^\/docs\/(jp|ja|ru|zh|zh-CN)\/?$/)) {
                    return '/docs/';
                }

                // Handle other docs paths
                if (path.startsWith('/docs/')) {
                    const normalized = path
                        .replace(/^\/docs\/(jp|ja|ru|zh|zh-CN)\//, '/docs/')  // Remove /docs/locale/
                        .replace(/^\/docs\/(jp|ja|ru|zh|zh-CN)$/, '/docs/');   // Remove /docs/locale
                    return normalized;
                }

                // Handle non-docs paths
                const normalized = path
                    .replace(/^\/(jp|ja|ru|zh|zh-CN)\//, '/')             // Remove /locale/
                    .replace(/^\/(jp|ja|ru|zh|zh-CN)$/, '/');             // Remove /locale
                return normalized;
            };

            const normalizedCurrent = normalizePathForComparison(currentPath);
            const normalizedPrevious = normalizePathForComparison(previousLocationRef.current);

            // It's a language change if:
            // 1. The language change flag is set, OR
            // 2. The normalized paths are the same (same content, different locale)
            return isLanguageChangeRef.current || normalizedCurrent === normalizedPrevious;
        };

        // If the path changed, decide whether to close the menu
        if (currentPath !== previousLocationRef.current) {
            const langChange = isLanguageChange();

            if (!langChange) {
                setMenuState(false);
            } else {
                // Reset the language change flag after navigation is complete
                if (languageChangeTimeoutRef.current) {
                    clearTimeout(languageChangeTimeoutRef.current);
                }
                languageChangeTimeoutRef.current = setTimeout(() => {
                    isLanguageChangeRef.current = false;
                }, 300);
            }
        }

        // Update the previous path reference and store it
        previousLocationRef.current = currentPath;
        sessionStorage.setItem('mobilemenu_previous_path', currentPath);
    }, [location.pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (currentMenuState) {
            // Store original overflow style
            const originalOverflow = document.body.style.overflow;
            const originalPosition = document.body.style.position;

            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';

            // Cleanup function
            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.position = originalPosition;
                document.body.style.width = '';
                document.body.style.height = '';
            };
        }
    }, [currentMenuState]);

    // Close mobile menu when viewport exceeds mobile breakpoint
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= LAPTOP_BREAKPOINT && currentMenuState) {
                setMenuState(false);
            }
        };

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Also check on mount in case the component mounts with a large viewport
        handleResize();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [currentMenuState, LAPTOP_BREAKPOINT]);

    // Handle language change
    const handleLanguageChange = (locale, href) => {
        // Set the flag BEFORE navigation
        isLanguageChangeRef.current = true;

        // Clear any existing timeout
        if (languageChangeTimeoutRef.current) {
            clearTimeout(languageChangeTimeoutRef.current);
        }

        // Set a backup timeout to reset the flag (in case something goes wrong)
        languageChangeTimeoutRef.current = setTimeout(() => {
            isLanguageChangeRef.current = false;
        }, 1000);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (languageChangeTimeoutRef.current) {
                clearTimeout(languageChangeTimeoutRef.current);
            }
        };
    }, []);

    // Function to handle menu close
    const handleMenuClose = () => {
        setMenuState(false);
    };

    const handleItemClick = (item) => {
        // Close menu for non-collapsible items
        if (item && !item.collapsible) {
            handleMenuClose();
        }
    };

    return(
        <>
            <Hamburger
                onClick={() => setMenuState(!currentMenuState)}
            />
            <div className={currentMenuState ? styles.docsMobileMenuBackdropActive : styles.docsMobileMenuBackdropInactive}/>
            <MobileSideBarMenuContents
                onClick={(item) => {
                    if (!item.collapsible) {
                        setMenuState(!currentMenuState)
                    }
                }}
                onClose={handleMenuClose}
                onLanguageChange={handleLanguageChange}
                sidebar={sidebar} // Left sidebar items
                menu={menu} // Top level menu items
                isVisible={currentMenuState} // Pass menu visibility state
                className={currentMenuState
                    ? styles.docsMobileMenuActive
                    : styles.docsMobileMenuHidden}
            />
        </>
    );

}

export default MobileSideBarMenu;