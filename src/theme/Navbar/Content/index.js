import React from 'react';
import clsx from 'clsx';
import { useThemeConfig } from '@docusaurus/theme-common';
import {
  splitNavbarItems,
  useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import NavbarItem from '@theme/NavbarItem';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import NavbarLogo from '@theme/Navbar/Logo';
import styles from './styles.module.css';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
function useNavbarItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useThemeConfig().navbar.items;
}

function useNavbarSecondaryItems() {
  // TODO temporary casting until ThemeConfig type is improved
  return useDocusaurusContext().siteConfig.customFields.secondaryNavItems ?? [];
}

function NavbarItems({ items }) {
  return (
    <>
      {items.map((item, i) => (
        <NavbarItem {...item} key={i} />
      ))}
    </>
  );
}
function NavbarContentLayout({ left, right }) {
  return (
    <div className={clsx('navbar__inner', styles.navbarInner)}>
      <div className="navbar__items">{left}</div>
      <div className="navbar__items navbar__items--right">{right}</div>
    </div>
  );
}
export default function NavbarContent() {
  const mobileSidebar = useNavbarMobileSidebar();
  const items = useNavbarItems();
  const [leftItems, rightItems] = splitNavbarItems(items);
  const secondaryItems = useNavbarSecondaryItems()
  return (
    <div className={styles.navbarHeaderContainer}>
      <NavbarContentLayout
        left={
          // TODO stop hardcoding items?
          <>
            <NavbarLogo />
            <div className={clsx(styles.navbarItemsList, 'navbar-items-list')}>
              <NavbarItems items={leftItems} />
            </div>
          </>
        }
        right={
          <>
          <NavbarItems items={rightItems} />
          {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
          </>
        }
      />
      <div className={clsx('secondary-nav--items' ,styles.secondaryMenu)}>
        <NavbarItems items={secondaryItems} />
      </div>
    </div>
  );
}
