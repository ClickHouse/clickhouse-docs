import React, { useState } from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './CustomSidebarItems.module.scss';

const CustomSidebarItems = ({ items, activePath, level = 1, onItemClick }) => {
    const location = useLocation();

    const isActiveItem = (item) => {
        if (!item.href) return false;
        const currentPath = activePath || location.pathname;
        return currentPath === item.href || currentPath.startsWith(item.href + '/');
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

    // Initialize collapsed state - only expand items that are part of the active path
    const getInitialCollapsedState = () => {
        const collapsed = new Set();
        const currentPath = activePath || location.pathname;

        // First, check if there's any active item in the entire structure
        const hasAnyActiveItem = (itemsList) => {
            return itemsList.some(item => {
                if (isActiveItem(item)) return true;
                if (item.items && hasAnyActiveItem(item.items)) return true;
                return false;
            });
        };

        const checkAndExpandActiveItems = (itemsList, currentLevel) => {
            itemsList.forEach((item, index) => {
                const itemId = `${item.label}-${currentLevel}-${index}`;

                // Check if item has children (regardless of type property)
                if (item.items && item.items.length > 0) {
                    // Check if this category or any of its children are active
                    const isActiveCategory = hasActiveChild(item) || isActiveItem(item);

                    if (!isActiveCategory) {
                        // Collapse by default if not in active path
                        collapsed.add(itemId);
                    }

                    // Recursively check children
                    if (!collapsed.has(itemId)) {
                        checkAndExpandActiveItems(item.items, currentLevel + 1);
                    }
                }
            });
        };

        if (items) {
            // If no active items found anywhere, collapse everything
            if (!hasAnyActiveItem(items)) {
                const collapseAllItems = (itemsList, currentLevel) => {
                    itemsList.forEach((item, index) => {
                        const itemId = `${item.label}-${currentLevel}-${index}`;
                        // Collapse any item that has children (regardless of type)
                        if (item.items && item.items.length > 0) {
                            collapsed.add(itemId);
                            collapseAllItems(item.items, currentLevel + 1);
                        }
                    });
                };
                collapseAllItems(items, level);
            } else {
                // Only expand items in the active path
                checkAndExpandActiveItems(items, level);
            }
        }

        return collapsed;
    };

    const [collapsedItems, setCollapsedItems] = useState(getInitialCollapsedState());

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
                            // Only expand/collapse if not clicking on the text
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
                            />
                        </ul>
                    )}
                </li>
            );
        }

        // Handle regular links
        if (item.href) {
            const LinkComponent = item.href.startsWith('http') ? 'a' : Link;
            const linkProps = item.href.startsWith('http')
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