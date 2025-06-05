import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.scss'
import IconClose from '@theme/Icon/Close';
import IconArrowLeft from '@site/static/img/arrowleft.svg';
import IconArrowRight from '@site/static/img/arrowright.svg';
import clsx from 'clsx'
import CustomSidebarItems from './CustomSidebarItems'
import { ThemeClassNames } from '@docusaurus/theme-common'
import NavbarLogo from '@theme/Navbar/Logo';
import ColorModeToggle from "../../components/ColorModeToggler";
import Translate from "@docusaurus/Translate";
import { useLocation } from '@docusaurus/router';
import { useHistory } from '@docusaurus/router';
import MobileLanguagePicker from "./MobileLanguagePicker";

const MobileSideBarMenuContents = ({ className, onClick, onClose, sidebar, path, menu, isVisible = true }) => {
    const [showTopLevel, setShowTopLevel] = useState(false);
    const location = useLocation();
    const history = useHistory();

    // Reset to sidebar view (showTopLevel = false) whenever the mobile menu becomes visible
    useEffect(() => {
        if (isVisible) {
            setShowTopLevel(false);
        }
    }, [isVisible]);

    // Get current locale from URL
    const getCurrentLocale = () => {
        const pathname = location.pathname;
        const docsLocaleMatch = pathname.match(/^\/docs\/(jp|ja|ru|zh|zh-CN)(?=\/|$)/);
        return docsLocaleMatch ? docsLocaleMatch[1] : 'en';
    };

    // Normalize path for comparison (remove locale prefix if present)
    const normalizePath = (path) => {
        if (!path) return '';
        // Remove locale prefix from path for comparison
        return path.replace(/^\/docs\/(jp|ja|ru|zh|zh-CN)/, '/docs');
    };

    // Check if the current path exists in the sidebar
    const isCurrentPathInSidebar = () => {
        if (!sidebar || sidebar.length === 0) return false;

        const normalizedCurrentPath = normalizePath(location.pathname);

        const checkItemsRecursively = (items) => {
            return items.some(item => {
                // Check if this item matches the current path
                const itemHref = item.href || (item.customProps && item.customProps.href);
                if (itemHref) {
                    const normalizedItemHref = normalizePath(itemHref);
                    if (normalizedCurrentPath === normalizedItemHref || normalizedCurrentPath.startsWith(normalizedItemHref + '/')) {
                        return true;
                    }
                }

                // Check children recursively
                if (item.items && item.items.length > 0) {
                    return checkItemsRecursively(item.items);
                }

                return false;
            });
        };

        return checkItemsRecursively(sidebar);
    };

    // Check if we're on a docs root page (should show only top-level menu)
    const isDocsRootPage = () => {
        const docsRootPaths = ['/docs/', '/docs/jp/', '/docs/ru/', '/docs/zh/'];
        return docsRootPaths.includes(location.pathname);
    };

    // Check if we should show the main menu instead of sidebar
    const shouldShowMainMenu = () => {
        return isDocsRootPage() || !isCurrentPathInSidebar();
    };

    // Find which top-level category we're currently in
    const getCurrentCategory = () => {
        if (!menu || !path) return null;

        return menu.find(category => {
            // Check if current path matches any of the category's items
            const matchesCategory = category.customProps?.href && path.startsWith(category.customProps.href);
            const matchesItems = category.items?.some(item =>
                item.href && path.startsWith(item.href)
            );
            return matchesCategory || matchesItems;
        });
    };

    const currentCategory = getCurrentCategory();

    // Handle item click - navigate and potentially close the mobile sidebar
    const handleItemClick = (item) => {
        // Handle navigation for items with href
        let itemHref = item.href || (item.customProps && item.customProps.href);

        if (itemHref) {
            // Determine if we should add /docs/ prefix
            // This happens when we're in the main menu OR when the current path suggests we're in docs
            const isInMainMenu = shouldShowMainMenu();
            const isDocsContext = location.pathname.startsWith('/docs/');
            const shouldAddDocsPrefix = (isInMainMenu || isDocsContext) &&
                !itemHref.startsWith('/docs/') &&
                !itemHref.startsWith('http');

            console.log('Navigation debug:', {
                item: item.label,
                originalHref: itemHref,
                isInMainMenu,
                isDocsContext,
                shouldAddDocsPrefix,
                currentPath: location.pathname
            });

            if (shouldAddDocsPrefix) {
                const currentLocale = getCurrentLocale();
                if (currentLocale !== 'en') {
                    itemHref = `/docs/${currentLocale}${itemHref}`;
                } else {
                    itemHref = `/docs${itemHref}`;
                }
                console.log('Fixed href:', itemHref);
            }

            // Navigate to the href
            if (itemHref.startsWith('http')) {
                // External link
                window.open(itemHref, '_blank', 'noopener,noreferrer');
            } else {
                // Internal link
                history.push(itemHref);
            }

            // Close the menu after navigation
            if (onClose) {
                onClose();
            }
        }

        // Call the onClick handler from parent if provided
        if (onClick) {
            onClick(item);
        }
    };

    // Generic function to render CustomSidebarItems with consistent styling
    const renderDocSidebarItems = (items, activePath, forceCollapsible = false) => {
        return (
            <ul className={clsx(
                ThemeClassNames.docs.docSidebarMenu,
                'menu__list',
                styles.docsMobileMenuItems
            )}>
                <CustomSidebarItems
                    items={items || []}
                    activePath={activePath}
                    level={1}
                    onItemClick={handleItemClick}
                    isMenuVisible={isVisible}
                    forceCollapsible={forceCollapsible}
                />
            </ul>
        );
    };

    // Render the enhanced header with logo and navigation toggle
    const renderHeader = () => {
        const isTopLevel = showTopLevel || shouldShowMainMenu();

        return (
            <div className={clsx("navbar-sidebar__brand", styles.docsMobileMenu_header)}>
                <div className={styles.toplevel}>
                    {/* Left Side - Logo and Navigation Toggle */}
                    <div className={styles.leftSection}>
                        <NavbarLogo/>
                    </div>

                    {/* Right Side - Controls */}
                    <div className={styles.headerActions}>
                        <MobileLanguagePicker/>
                        <ColorModeToggle/>
                        <IconClose width={10} height={10} onClick={onClose || onClick} style={{"align-self":"center"}}/>
                    </div>
                </div>
                <div className={styles.bottomLevel}>
                    {!shouldShowMainMenu() && (
                        <button
                            className={styles.levelToggleButton}
                            onClick={() => setShowTopLevel(!showTopLevel)}
                            aria-label={showTopLevel ? "Go to current sidebar" : "Go to top level menu"}
                        >
                            {showTopLevel ? (
                                <>
                                    <IconArrowRight className={styles.arrow}/>
                                    <span>
                                        <Translate id="mobile.sidebar.current">sidebar</Translate>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <IconArrowLeft className={styles.arrow}/>
                                    <span>
                                        <Translate id="mobile.sidebar.toplevel">main-menu</Translate>
                                    </span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Render top-level menu using DocSidebarItems
    const renderTopLevelMenu = () => {
        return (
            <>
                {renderHeader()}
                {renderDocSidebarItems(menu.dropdownCategories || [], location.pathname, true)}
            </>
        );
    };

    // Render current sidebar with back navigation
    const renderCurrentSidebar = () => {
        return (
            <>
                {renderHeader()}
                {renderDocSidebarItems(sidebar, location.pathname, false)}
            </>
        );
    };

    // If we're on a docs root page or invalid path, always show the top-level menu
    if (shouldShowMainMenu()) {
        return (
            <div className={clsx(styles.docsMobileMenu, className)}>
                {renderTopLevelMenu()}
            </div>
        );
    }

    return (
        <div className={clsx(styles.docsMobileMenu, className)}>
            {showTopLevel ? renderTopLevelMenu() : renderCurrentSidebar()}
        </div>
    );
};

export default MobileSideBarMenuContents;
