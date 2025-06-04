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

const MobileSideBarMenuContents = ({ className, onClick, onClose, sidebar, path, menu, isVisible = true }) => {
    const [showTopLevel, setShowTopLevel] = useState(false);
    const location = useLocation();

    // Reset to sidebar view (showTopLevel = false) whenever the mobile menu becomes visible
    useEffect(() => {
        if (isVisible) {
            setShowTopLevel(false);
        }
    }, [isVisible]);

    console.log('Menu data:', menu);
    console.log('Menu keys:', Object.keys(menu));
    console.log('dropdownCategories:', menu.dropdownCategories);
    console.log('Sidebar data:', sidebar);
    console.log('Current path:', location.pathname);

    // Check if we're on a docs root page (should show only top-level menu)
    const isDocsRootPage = () => {
        const docsRootPaths = ['/docs/', '/docs/jp/', '/docs/ru/', '/docs/zh/'];
        return docsRootPaths.includes(location.pathname);
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

    // Handle item click - close the mobile sidebar
    const handleItemClick = (item) => {
        // Call the onClick handler from parent if provided
        if (onClick) {
            onClick(item);
        }

        // For non-collapsible items, close the menu
        if (item && !item.collapsible && onClose) {
            onClose();
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
        const isTopLevel = showTopLevel || isDocsRootPage();

        return (
            <div className={clsx("navbar-sidebar__brand", styles.docsMobileMenu_header)}>
                <div className={styles.toplevel}>
                    {/* Left Side - Logo and Navigation Toggle */}
                    <div className={styles.leftSection}>
                        <NavbarLogo/>
                    </div>

                    {/* Right Side - Controls */}
                    <div className={styles.headerActions}>
                        <ColorModeToggle/>
                        <IconClose width={10} height={10} onClick={onClose || onClick} style={{"align-self":"center"}}/>
                    </div>
                </div>
                <div className={styles.bottomLevel}>
                    {!isDocsRootPage() && (
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

    // If we're on a docs root page, always show the top-level menu
    if (isDocsRootPage()) {
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