import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { translate } from '@docusaurus/Translate';
import { useLocation } from '@docusaurus/router';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import IconLanguage from '@theme/Icon/Language';
import styles from './styles.module.css';
import { applyTrailingSlash } from '@docusaurus/utils-common';

// Custom createUrl function as our languages live under dedicated sites
function createUrl({ locale, fullyQualified }) {
  const {
    siteConfig: { baseUrl, url, trailingSlash },
    i18n: { defaultLocale, currentLocale },
  } = useDocusaurusContext();
  const { pathname } = useLocation();

  const canonicalPathname = applyTrailingSlash(pathname, {
    trailingSlash,
    baseUrl,
  });

  // Extract the path suffix after the baseUrl
  // We need to handle both the current locale's baseUrl and extract the actual page path
  // For example: /docs/jp/tutorial with baseUrl /docs/jp/ should extract 'tutorial'

  // First, normalize both paths with trailing slashes for consistent comparison
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  const normalizedPathname = canonicalPathname.endsWith('/') ? canonicalPathname : canonicalPathname + '/';

  // Extract the suffix by removing the baseUrl prefix
  let pathnameSuffix = normalizedPathname.startsWith(normalizedBaseUrl)
    ? normalizedPathname.substring(normalizedBaseUrl.length)
    : '';

  // IMPORTANT: Always use 'docs' as the base path, regardless of current locale
  // This ensures language switcher generates correct absolute URLs:
  // - From /docs/jp/ to English: /docs/ (not /docs/jp/en)
  // - From /docs/jp/ to Russian: /docs/ru/ (not /docs/jp/ru)
  const basePath = 'docs';

  // Construct the localized URL
  // For non-default locales: /docs/{locale}/{pathSuffix}
  // For default locale: /docs/{pathSuffix}
  function getLocalizedUrl(locale) {
    if (locale === defaultLocale) {
      // Default locale (English): /docs/{pathSuffix}
      return `/${basePath}/${pathnameSuffix}`;
    } else {
      // Other locales: /docs/{locale}/{pathSuffix}
      return `/${basePath}/${locale}/${pathnameSuffix}`;
    }
  }

  // Clean up any double slashes
  let localizedPath = getLocalizedUrl(locale).replace(/\/+/g, '/');

  // Preserve trailing slash for root paths (when pathnameSuffix is empty)
  // Remove trailing slash for non-root paths if original didn't have one
  if (pathnameSuffix === '' || pathnameSuffix === '/') {
    // Root path - ensure it has a trailing slash
    if (!localizedPath.endsWith('/')) {
      localizedPath += '/';
    }
  } else if (!pathname.endsWith('/') && localizedPath.endsWith('/')) {
    // Non-root path - match the trailing slash behavior of the original
    localizedPath = localizedPath.slice(0, -1);
  }

  return `${fullyQualified ? url : ''}${localizedPath}`;
}

export default function LocaleDropdownNavbarItem({
  mobile,
  ...props
}) {
  const {
    i18n: { currentLocale, locales, localeConfigs },
  } = useDocusaurusContext();
  const { search, hash } = useLocation();

  const localeItems = locales.map((locale) => {
    const baseTo = `pathname://${createUrl({
      locale,
      fullyQualified: false,
    })}`;

    const to = `${baseTo}${search}${hash}`;
    return {
      label: localeConfigs[locale].label,
      lang: localeConfigs[locale].htmlLang,
      to,
      target: '_self',
      autoAddBaseUrl: false,
      className:
        // eslint-disable-next-line no-nested-ternary
        locale === currentLocale
          ? // Similar idea as DefaultNavbarItem: select the right Infima active
          // class name. This cannot be substituted with isActive, because the
          // target URLs contain `pathname://` and therefore are not NavLinks!
          mobile
            ? 'menu__link--active'
            : 'dropdown__link--active'
          : '',
    };
  });
  const items = [...localeItems];
  // Mobile is handled a bit differently
  const dropdownLabel = mobile
    ? translate({
      message: 'Languages',
      id: 'theme.navbar.mobileLanguageDropdown.label',
      description: 'The label for the mobile language switcher dropdown',
    })
    : localeConfigs[currentLocale].label;
  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      label={
        <>
          <IconLanguage className={styles.iconLanguage} />
          {dropdownLabel}
        </>
      }
      items={items}
    />
  );
}
