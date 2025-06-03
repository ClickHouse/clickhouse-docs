import React, { useState } from 'react';
import styles from './styles.module.scss'
import IconClose from '@theme/Icon/Close';
import IconArrowLeft from '@theme/Icon/Arrow'; // You may need to import or create this
import clsx from 'clsx'
import DocSidebarItems from '@theme/DocSidebarItems'
import { ThemeClassNames } from '@docusaurus/theme-common'
import ClickHouseLogo from '../../icons/ClickHouseLogo'
import ColorModeToggle from "../../components/ColorModeToggler";
import Translate from "@docusaurus/Translate";

const MobileSideBarMenuContents = ({ className, onClick, sidebar, path, menu }) => {
    const [showTopLevel, setShowTopLevel] = useState(false);

    console.log('Menu data:', menu);
    console.log('Sidebar data:', sidebar);
    console.log('Current path:', path);

    // Find which top-level category we're currently in
    const getCurrentCategory = () => {
        if (!menu?.dropdownCategories || !path) return null;

        return menu.dropdownCategories.find(category => {
            // Check if current path matches any of the category's items
            const matchesCategory = category.customProps?.href && path.startsWith(category.customProps.href);
            const matchesItems = category.items?.some(item =>
                item.href && path.startsWith(item.href)
            );
            return matchesCategory || matchesItems;
        });
    };

    const currentCategory = getCurrentCategory();

    // Helper function to transform menu items with translations
    const transformMenuItems = (items) => {
        return items?.map(item => {
            const baseTranslationId = `sidebar.dropdownCategories.${item.label.replace(/\s+/g, '')}`;

            return {
                ...item,
                label: (
                    <Translate
                        id={baseTranslationId}
                        description={`Navigation label for ${item.label}`}
                    >
                        {item.label}
                    </Translate>
                ),
                // Transform nested items if they exist
                items: item.items ? transformSubItems(item.items, baseTranslationId) : undefined
            };
        });
    };

    // Helper function for transforming sub-items
    const transformSubItems = (subItems, parentTranslationId) => {
        return subItems?.map(subItem => ({
            ...subItem,
            label: (
                <Translate
                    id={`${parentTranslationId}.${subItem.label.replace(/\s+/g, '')}`}
                    description={`Navigation sublabel for ${subItem.label}`}
                >
                    {subItem.label}
                </Translate>
            )
        }));
    };

    // Handle item click - close the mobile sidebar
    const handleItemClick = () => {
        if (onClick) {
            onClick(); // Close the mobile sidebar
        }
    };

    // Handle back button click
    const handleBackClick = () => {
        setShowTopLevel(true);
    };

    // Handle top-level category click
    const handleCategoryClick = (category) => {
        setShowTopLevel(false);
        // Optionally navigate to the category's main page
        if (category.customProps?.href) {
            window.location.href = category.customProps.href;
        }
    };

    // Render top-level menu
    const renderTopLevelMenu = () => {
        const transformedMenuItems = menu?.dropdownCategories ?
            transformMenuItems(menu.dropdownCategories) : [];

        return (
            <>
                <div className={clsx("navbar-sidebar__brand", styles.docsMobileMenu_header)}>
                    <ClickHouseLogo width={150} />
                    <ColorModeToggle/>
                    <IconClose onClick={onClick} />
                </div>

                <ul className={clsx(
                    ThemeClassNames.docs.docSidebarMenu,
                    'menu__list',
                    styles.docsMobileMenuItems
                )}>
                    {transformedMenuItems.map((category, index) => (
                        <li key={index} className="menu__list-item">
                            <div
                                className={clsx(
                                    'menu__link',
                                    currentCategory?.label === category.label && 'menu__link--active'
                                )}
                                onClick={() => handleCategoryClick(category)}
                            >
                                {category.label}
                                {category.description && (
                                    <div className={styles.categoryDescription}>
                                        {category.description}
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
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
                                <Translate id="mobile.sidebar.back">Back</Translate>
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
                        <IconClose onClick={onClick} />
                    </div>
                </div>

                <ul className={clsx(
                    ThemeClassNames.docs.docSidebarMenu,
                    'menu__list',
                    styles.docsMobileMenuItems
                )}>
                    <DocSidebarItems
                        items={sidebar || []}
                        activePath={path}
                        level={1}
                        onItemClick={handleItemClick}
                    />
                </ul>
            </>
        );
    };

    return (
        <div className={clsx(styles.docsMobileMenu, className)}>
            {showTopLevel ? renderTopLevelMenu() : renderCurrentSidebar()}
        </div>
    );
};

export default MobileSideBarMenuContents;