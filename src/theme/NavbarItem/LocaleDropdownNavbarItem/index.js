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
  const pathnameSuffix = canonicalPathname.replace(baseUrl, '');

  // Extract the base path from baseUrl (e.g., '/docs/' -> 'docs')
  // Remove leading and trailing slashes to get the clean base path
  const basePath = baseUrl.replace(/^\/|\/$/g, '');

  // Construct the localized URL
  // For non-default locales: /{basePath}/{locale}/{pathSuffix}
  // For default locale: /{basePath}/{pathSuffix}
  function getLocalizedUrl(locale) {
    if (locale === defaultLocale) {
      // Default locale: /docs/{pathSuffix}
      return `/${basePath}/${pathnameSuffix}`;
    } else {
      // Other locales: /docs/{locale}/{pathSuffix}
      return `/${basePath}/${locale}/${pathnameSuffix}`;
    }
  }

  // Clean up any double slashes
  const localizedPath = getLocalizedUrl(locale).replace(/\/+/g, '/');

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
      fullyQualified: true,
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
