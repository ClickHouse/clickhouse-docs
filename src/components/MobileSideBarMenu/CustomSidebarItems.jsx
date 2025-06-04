import React, { useState } from 'react';
import clsx from 'clsx';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import styles from './CustomSidebarItems.module.scss';

const CustomSidebarItems = ({ items, activePath, level = 1, onItemClick, isMenuVisible = true }) => {
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

        const collapseAllCollapsibleItems = (itemsList, currentLevel) => {
            itemsList.forEach((item, index) => {
                const itemId = `${item.label}-${currentLevel}-${index}`;

                // For level 1 (top-level), always treat as collapsible if it has children
                // For deeper levels, respect the collapsible property
                const isCollapsibleItem = currentLevel === 1
                    ? (item.items && item.items.length > 0)
                    : (item.items && item.items.length > 0 && item.collapsible !== false);

                if (isCollapsibleItem) {
                    collapsed.add(itemId);
                    // Recursively collapse children too
                    collapseAllCollapsibleItems(item.items, currentLevel + 1);
                }
            });
        };

        const expandActivePathItems = (itemsList, currentLevel) => {
            itemsList.forEach((item, index) => {
                const itemId = `${item.label}-${currentLevel}-${index}`;

                // Check if this item or any of its children are in the active path
                if (item.items && item.items.length > 0) {
                    const isActiveCategory = hasActiveChild(item) || isActiveItem(item);

                    if (isActiveCategory) {
                        // Remove from collapsed set (expand it)
                        collapsed.delete(itemId);
                        // Recursively check children
                        expandActivePathItems(item.items, currentLevel + 1);
                    }
                }
            });
        };

        if (items && items.length > 0) {
            // First: Collapse everything that is collapsible
            collapseAllCollapsibleItems(items, level);

            // Second: Expand only items in the active path
            expandActivePathItems(items, level);
        }

        return collapsed;
    };

    const [collapsedItems, setCollapsedItems] = useState(getInitialCollapsedState());

    // Reset collapsed state when menu becomes visible (reopened)
    React.useEffect(() => {
        if (isMenuVisible) {
            setCollapsedItems(getInitialCollapsedState());
        }
    }, [isMenuVisible]);

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
        // For level 1 (top-level), always treat as collapsible if it has children
        // For deeper levels, respect the collapsible property
        const isCollapsible = level === 1
            ? hasChildren
            : (hasChildren && item.collapsible !== false);
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
                                [styles.collapsible]: hasChildren && isCollapsible,
                                [styles.collapsed]: isCollapsed,
                            }
                        )}
                        onClick={(e) => {
                            // Only expand/collapse if not clicking on the text and item is collapsible
                            if (hasChildren && isCollapsible && !e.target.closest(`.${styles.categoryLabel}`)) {
                                toggleCollapse(itemId);
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                if (hasChildren && isCollapsible) {
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
                        {hasChildren && isCollapsible && (
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