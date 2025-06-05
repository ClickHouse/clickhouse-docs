import React, { useState, useEffect } from 'react';
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
import { useDocsSidebar } from '@docusaurus/theme-common/internal';

const MobileSideBarMenuContents = ({ className, onClick, onClose, sidebar, path, menu, isVisible = true, onLanguageChange }) => {
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

    // Handle language change - notify parent and then navigate
    const handleLanguageChange = (locale, href) => {
        // Notify parent component about language change FIRST
        if (onLanguageChange) {
            onLanguageChange(locale, href);
        }

        // Then navigate (parent has already set the language change flag)
        history.push(href);
    };

    // Handle item click - navigate and potentially close the mobile sidebar
    const handleItemClick = (item) => {
        // Handle navigation for items with href
        let itemHref = item.href || (item.customProps && item.customProps.href);

        if (itemHref) {
            // Skip processing for external links
            if (itemHref.startsWith('http')) {
                window.open(itemHref, '_blank', 'noopener,noreferrer');
                if (onClose) {
                    onClose();
                }
                if (onClick) {
                    onClick(item);
                }
                return;
            }

            // For internal links, check if we need to add locale prefix
            // Only process relative paths that don't already contain /docs/
            if (!itemHref.includes('/docs/')) {
                const isInMainMenu = shouldShowMainMenu();
                const isDocsContext = location.pathname.startsWith('/docs/');

                if (isInMainMenu || isDocsContext) {
                    const currentLocale = getCurrentLocale();
                    if (currentLocale !== 'en') {
                        // Ensure the path starts with /
                        const cleanPath = itemHref.startsWith('/') ? itemHref : `/${itemHref}`;
                        itemHref = `/docs/${currentLocale}${cleanPath}`;
                    } else {
                        // Ensure the path starts with /
                        const cleanPath = itemHref.startsWith('/') ? itemHref : `/${itemHref}`;
                        itemHref = `/docs${cleanPath}`;
                    }
                }
            }

            // Navigate to the internal link
            history.push(itemHref);

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

    // Helper function to determine the current sidebar name
    const getCurrentSidebarName = () => {
        // You'll need to determine this based on your app's logic
        // This could be passed as a prop, derived from the URL, or stored in context
        // For now, returning a placeholder - you'll need to implement this based on your setup

        const pathname = location.pathname;

        // Example logic - adjust based on your URL structure
        if (pathname.includes('/cloud/')) return 'cloud';
        if (pathname.includes('/docs/')) return 'docs';
        if (pathname.includes('/sql-reference/')) return 'sqlreference';

        // You might need to add more logic here based on your specific routing
        // or pass the sidebar name as a prop to this component
        return 'docs'; // default fallback
    };

    // Helper function to apply translations to menu items
    const applyTranslationsToItems = (items, translationPrefix) => {
        if (!items) return [];

        return items.map(item => ({
            ...item,
            label: (
                <Translate id={`${translationPrefix}.${item.label}`}>
                    {item.label}
                </Translate>
            ),
            items: item.items?.map(subItem => ({
                ...subItem,
                label: (
                    <Translate id={`${translationPrefix}.${item.label}.${subItem.label}`}>
                        {subItem.label}
                    </Translate>
                )
            }))
        }));
    };

    // Generic function to render CustomSidebarItems with consistent styling and translations
    const renderDocSidebarItems = (items, activePath, forceCollapsible = false, useSidebarTranslations = false) => {
        let translatedItems = items;

        if (useSidebarTranslations) {
            // For current sidebar, use dynamic sidebar name only if available
            const sidebarName = getCurrentSidebarName();
            if (sidebarName) {
                const translationPrefix = `sidebar.${sidebarName}.category`;
                translatedItems = applyTranslationsToItems(items, translationPrefix);
            }
            // If no sidebar name, use items as-is (no translation)
        } else {
            // For top-level menu, always use dropdown categories translations
            const translationPrefix = 'sidebar.dropdownCategories.category';
            translatedItems = applyTranslationsToItems(items, translationPrefix);
        }

        return (
            <ul className={clsx(
                ThemeClassNames.docs.docSidebarMenu,
                'menu__list',
                styles.docsMobileMenuItems
            )}>
                <CustomSidebarItems
                    items={translatedItems || []}
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
                        <MobileLanguagePicker onLanguageChange={handleLanguageChange} />
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

    // Render top-level menu using DocSidebarItems with dropdown categories translations
    const renderTopLevelMenu = () => {
        return (
            <>
                {renderHeader()}
                {renderDocSidebarItems(
                    menu?.dropdownCategories || menu || [],
                    location.pathname,
                    true,
                    false // Use dropdown categories translations
                )}
            </>
        );
    };

    // Render current sidebar with dynamic sidebar translations
    const renderCurrentSidebar = () => {
        return (
            <>
                {renderHeader()}
                {renderDocSidebarItems(
                    sidebar,
                    location.pathname,
                    false,
                    true // Use dynamic sidebar translations
                )}
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