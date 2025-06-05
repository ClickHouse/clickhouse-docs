import React, { useState } from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './customSidebarItems.module.scss';

const CustomSidebarItems = ({ items, activePath, level = 1, onItemClick, isMenuVisible = true, forceCollapsible = false }) => {
    const location = useLocation();

    const isActiveItem = (item) => {
        const itemHref = item.href || (item.customProps && item.customProps.href);
        if (!itemHref) return false;
        const currentPath = activePath || location.pathname;
        return currentPath === itemHref || currentPath.startsWith(itemHref + '/');
    };

    const hasActiveChild = (item) => {
        if (!item.items) return false;
        const currentPath = activePath || location.pathname;

        return item.items.some(child => {
            if (child.href && (currentPath === child.href || currentPath.startsWith(child.href + '/'))) {
                return true;
            }
            return hasActiveChild(child);
        });
    };

    // Initialize collapsed state - main menu always collapsed, sidebar expands active path
    const getInitialCollapsedState = () => {
        const collapsed = new Set();

        const processItems = (itemsList, currentLevel) => {
            itemsList.forEach((item, index) => {
                const itemId = `${item.label}-${currentLevel}-${index}`;
                const hasChildren = item.items && item.items.length > 0;

                if (hasChildren) {
                    if (forceCollapsible) {
                        // Main menu: ALWAYS collapse everything
                        collapsed.add(itemId);
                    } else {
                        // Sidebar: only expand if this item or its children are in the active path
                        const shouldExpand = isActiveItem(item) || hasActiveChild(item);
                        if (!shouldExpand) {
                            collapsed.add(itemId);
                        }
                    }

                    // Recursively process children
                    processItems(item.items, currentLevel + 1);
                }
            });
        };

        console.log(`Getting initial state for ${forceCollapsible ? 'MAIN MENU' : 'SIDEBAR'}`);
        if (items && items.length > 0) {
            processItems(items, level);
        }

        return collapsed;
    };

    const [collapsedItems, setCollapsedItems] = useState(getInitialCollapsedState());

    // Reset collapsed state when menu becomes visible (reopened)
    React.useEffect(() => {
        setCollapsedItems(getInitialCollapsedState());
    }, [isMenuVisible, forceCollapsible, items, activePath, location.pathname]);

    const toggleCollapse = (itemId) => {
        const newCollapsed = new Set(collapsedItems);
        if (newCollapsed.has(itemId)) {
            newCollapsed.delete(itemId);
        } else {
            newCollapsed.add(itemId);
        }
        setCollapsedItems(newCollapsed);
    };

    const renderSidebarItem = (item, index) => {
        const itemId = `${item.label}-${level}-${index}`;
        const isActive = isActiveItem(item);
        const hasChildren = item.items && item.items.length > 0;
        // All items with children are collapsible - ignore the collapsible property completely
        const isCollapsible = hasChildren;
        const isCollapsed = collapsedItems.has(itemId);
        const hasActiveDescendant = hasActiveChild(item);

        // Handle different item types
        if (item.type === 'category' || (item.items && item.items.length > 0)) {
            return (
                <li key={itemId} className={clsx(styles.sidebarItem, styles.categoryItem)}>
                    <div
                        className={clsx(
                            styles.sidebarItemLink,
                            styles.categoryLink,
                            {
                                [styles.active]: isActive,
                                [styles.hasActiveChild]: hasActiveDescendant && !isActive,
                                [styles.collapsible]: hasChildren,
                                [styles.collapsed]: isCollapsed,
                            }
                        )}
                        onClick={(e) => {
                            // Only expand/collapse if not clicking on the text and item has children
                            if (hasChildren && !e.target.closest(`.${styles.categoryLabel}`)) {
                                toggleCollapse(itemId);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (hasChildren) {
                                    toggleCollapse(itemId);
                                }
                            }
                        }}
                    >
                        <span
                            className={styles.categoryLabel}
                            onClick={(e) => {
                                // Handle text click for navigation
                                e.stopPropagation();
                                if (onItemClick) {
                                    onItemClick(item);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (onItemClick) {
                                        onItemClick(item);
                                    }
                                }
                            }}
                        >
                            {item.label}
                        </span>
                        {hasChildren && (
                            <span
                                className={clsx(styles.collapseIcon, {
                                    [styles.collapsed]: isCollapsed
                                })}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCollapse(itemId);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggleCollapse(itemId);
                                    }
                                }}
                            >
                                ▼
                            </span>
                        )}
                    </div>
                    {hasChildren && !isCollapsed && (
                        <ul className={styles.sidebarSubItems}>
                            <CustomSidebarItems
                                items={item.items}
                                activePath={activePath}
                                level={level + 1}
                                onItemClick={onItemClick}
                                forceCollapsible={forceCollapsible}
                            />
                        </ul>
                    )}
                </li>
            );
        }

        // Handle regular links
        if (item.href || item.type === 'link') {
            const LinkComponent = item.href && item.href.startsWith('http') ? 'a' : Link;
            const linkProps = item.href && item.href.startsWith('http')
                ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' }
                : { to: item.href };

            return (
                <li key={itemId} className={clsx(styles.sidebarItem, styles.linkItem)}>
                    <LinkComponent
                        {...linkProps}
                        className={clsx(
                            styles.sidebarItemLink,
                            {
                                [styles.active]: isActive,
                            }
                        )}
                        onClick={() => {
                            if (onItemClick) {
                                onItemClick(item);
                            }
                        }}
                    >
                        {item.label}
                    </LinkComponent>
                </li>
            );
        }

        // Handle items without href (like separators or plain text)
        return (
            <li key={itemId} className={clsx(styles.sidebarItem, styles.textItem)}>
                <span className={styles.sidebarItemText}>{item.label}</span>
            </li>
        );
    };

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <>
            {items.map((item, index) => renderSidebarItem(item, index))}
        </>
    );
};

export default CustomSidebarItems;
