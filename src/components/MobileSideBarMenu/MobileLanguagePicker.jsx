import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import styles from './mobileLanguagePicker.module.scss';

const MobileLanguagePicker = ({ onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const { i18n } = useDocusaurusContext();

    // Get current locale from URL instead of relying solely on Docusaurus context
    const getCurrentLocaleFromURL = () => {
        const pathname = location.pathname;

        // Check if we're in a docs path with locale
        const docsLocaleMatch = pathname.match(/^\/docs\/(jp|ja|ru|zh|zh-CN)(?=\/|$)/);
        if (docsLocaleMatch) {
            return docsLocaleMatch[1];
        }

        // Check for root-level locale
        const rootLocaleMatch = pathname.match(/^\/(jp|ja|ru|zh|zh-CN)(?=\/|$)/);
        if (rootLocaleMatch) {
            return rootLocaleMatch[1];
        }

        // Default to English if no locale found
        return i18n.defaultLocale || 'en';
    };

    // Use URL-derived locale as the source of truth
    const currentLocale = getCurrentLocaleFromURL();

    // Get all available locales
    const locales = i18n.locales || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close dropdown when location changes (user navigated) and update current locale
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    // Get locale display name - optimized for your four languages
    const getLocaleLabel = (locale) => {
        const localeLabels = {
            en: 'EN',
            jp: 'JP',
            ja: 'JP', // Handle both jp and ja for Japanese
            ru: 'RU',
            zh: 'ZH',
            'zh-CN': 'ZH',
            'zh-TW': 'ZH'
        };

        return localeLabels[locale] || locale.toUpperCase();
    };

    // Get locale full name for accessibility - optimized for your four languages
    const getLocaleFullName = (locale) => {
        const localeNames = {
            en: 'English',
            jp: '日本語',
            ja: '日本語', // Handle both jp and ja for Japanese
            ru: 'Русский',
            zh: '中文',
            'zh-CN': '中文',
            'zh-TW': '中文'
        };

        return localeNames[locale] || locale;
    };

    // Handle language selection
    const handleLanguageSelect = (locale, href) => {
        setIsOpen(false);

        // Notify parent component about language change if callback provided
        if (onLanguageChange) {
            onLanguageChange(locale, href);
        } else {
            // Fallback navigation if no callback
            window.location.href = href;
        }
    };

    // If only one locale is configured, don't show the picker
    if (locales.length <= 1) {
        return null;
    }

    const currentLocaleLabel = getLocaleLabel(currentLocale);

    return (
        <div className={styles.languagePicker} ref={dropdownRef}>
            <button
                className={styles.languageButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Select language"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={styles.globeIcon}>
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                </svg>
                <span className={styles.languageText}>{currentLocaleLabel}</span>
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ''}`}
                >
                    <path d="M7 10l5 5 5-5z"/>
                </svg>
            </button>

            {isOpen && (
                <div className={styles.languageDropdown}>
                    {locales.map((locale) => {
                        // Skip current locale or show it as active
                        const isCurrentLocale = locale === currentLocale;

                        // Manual URL construction to ensure clean paths
                        let href;
                        let currentPath = location.pathname;

                        // Handle docs paths
                        if (currentPath.startsWith('/docs')) {
                            // Handle docs root paths specifically
                            if (currentPath === '/docs' || currentPath === '/docs/') {
                                if (locale === i18n.defaultLocale || locale === 'en') {
                                    href = '/docs/';
                                } else {
                                    href = `/docs/${locale}/`;
                                }
                            } else {
                                // Remove existing locale from docs path if present
                                let cleanPath = currentPath.replace(/^\/docs\/(jp|ja|ru|zh|zh-CN)(?=\/|$)/, '/docs');

                                // Build new URL with target locale
                                if (locale === i18n.defaultLocale || locale === 'en') {
                                    href = cleanPath;
                                } else {
                                    // For non-English locales, inject locale after /docs
                                    href = cleanPath.replace('/docs', `/docs/${locale}`);
                                }
                            }
                        } else {
                            // Handle non-docs paths (like home page, blog, etc.)
                            // Remove any existing locale prefix first
                            let cleanPath = currentPath.replace(/^\/(jp|ja|ru|zh|zh-CN)(?=\/|$)/, '');

                            // If nothing was removed, we're on a clean path already
                            if (cleanPath === currentPath) {
                                // We're on a path like '/' or '/blog' - no locale prefix to remove
                                cleanPath = currentPath;
                            }

                            // Ensure path starts with / (in case we removed a locale and left empty string)
                            if (!cleanPath.startsWith('/')) {
                                cleanPath = '/' + cleanPath;
                            }

                            // For home page specifically, handle it differently
                            if (cleanPath === '/' || cleanPath === '') {
                                if (locale === i18n.defaultLocale || locale === 'en') {
                                    href = '/';
                                } else {
                                    // For non-English, go to the docs root for that language
                                    href = `/docs/${locale}/`;
                                }
                            } else {
                                // For other non-docs pages
                                if (locale === i18n.defaultLocale || locale === 'en') {
                                    href = cleanPath;
                                } else {
                                    href = `/${locale}${cleanPath}`;
                                }
                            }
                        }

                        const localeLabel = getLocaleLabel(locale);
                        const localeFullName = getLocaleFullName(locale);

                        return (
                            <Link
                                key={locale}
                                to={href}
                                className={`${styles.languageOption} ${isCurrentLocale ? styles.languageOptionActive : ''}`}
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent the Link from navigating
                                    handleLanguageSelect(locale, href);
                                }}
                                aria-label={`Switch to ${localeFullName}`}
                            >
                                <span className={styles.languageName}>{localeFullName}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MobileLanguagePicker;
