import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.module.scss'
import IconClose from '@theme/Icon/Close';
import IconArrowLeft from '@site/static/img/arrowleft.svg';
import IconArrowRight from '@site/static/img/arrowright.svg';
import clsx from 'clsx'
import DocSidebarItems from '@theme/DocSidebarItems'
import { ThemeClassNames } from '@docusaurus/theme-common'
import ClickHouseLogo from '../../icons/ClickHouseLogo'
import ColorModeToggle from "../../components/ColorModeToggler";
import Translate from "@docusaurus/Translate";
import { useLocation } from '@docusaurus/router';

const MobileSideBarMenuContents = ({ className, onClick, onClose, sidebar, path, menu }) => {
    const [showTopLevel, setShowTopLevel] = useState(false);
    const location = useLocation();

    console.log('Menu data:', menu);
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

    // Handle back button click
    const handleBackClick = () => {
        setShowTopLevel(true);
    };

    // Handle top-level category click
    const handleTopLevelItemClick = (item) => {
        // If it's a category with items, go to the sidebar view
        if (item && item.items && item.items.length > 0) {
            setShowTopLevel(false);
            return;
        }
        // Otherwise close the sidebar (for direct links)
        if (onClose) {
            onClose();
        }
    };

    // Render top-level menu using DocSidebarItems
    const renderTopLevelMenu = () => {
        return (
            <>
                <div className={clsx("navbar-sidebar__brand", styles.docsMobileMenu_header)}>
                    <div className={styles.backNavigation}>
                        {!isDocsRootPage() && (
                            <button
                                className={styles.backButton}
                                onClick={() => setShowTopLevel(false)}
                                aria-label="Go to current sidebar"
                            >
                                <IconArrowLeft style={{ transform: 'rotate(180deg)' }} />
                                <span>
                                    <Translate id="mobile.sidebar.current">Current sidebar</Translate>
                                </span>
                            </button>
                        )}
                        {currentCategory && !isDocsRootPage() && (
                            <span className={styles.currentCategoryTitle}>
                                Top Level Navigation
                            </span>
                        )}
                    </div>
                    <div className={styles.headerActions}>
                        <ColorModeToggle/>
                        <IconClose onClick={onClose || onClick} />
                    </div>
                </div>

                <ul className={clsx(
                    ThemeClassNames.docs.docSidebarMenu,
                    'menu__list',
                    styles.docsMobileMenuItems
                )}>
                    <DocSidebarItems
                        items={menu.dropdownCategories || []}
                        activePath={path}
                        level={1}
                        onItemClick={handleItemClick}
                    />
                </ul>
            </>
        );
    };

    // Render current sidebar with back navigation
    const renderCurrentSidebar = () => {
        return (
            <>
                <div className={clsx("navbar-sidebar__brand", styles.docsMobileMenu_header)}>
                    <div className={styles.backNavigation}>
                        <button
                            className={styles.backButton}
                            onClick={handleBackClick}
                            aria-label="Back to main menu"
                        >
                            <IconArrowLeft />
                            <span>
                                <Translate id="mobile.sidebar.back">Main menu</Translate>
                            </span>
                        </button>
                        {currentCategory && (
                            <span className={styles.currentCategoryTitle}>
                                {currentCategory.label}
                            </span>
                        )}
                    </div>
                    <div className={styles.headerActions}>
                        <ColorModeToggle/>
                        <IconClose onClick={onClose || onClick} />
                    </div>
                </div>

                <ul className={clsx(
                    ThemeClassNames.docs.docSidebarMenu,
                    'menu__list',
                    styles.docsMobileMenuItems
                )}>
                    <DocSidebarItems
                        items={sidebar || []}
                        activePath={location.pathname}
                        level={1}
                        onItemClick={handleItemClick}
                    />
                </ul>
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