import React, { useState } from 'react';
import styles from './styles.module.css'
import IconClose from '@theme/Icon/Close';
import SearchBar from "@theme/SearchBar";
import clsx from 'clsx'
import DocSidebarItems from '@theme/DocSidebarItems'
import { ThemeClassNames } from '@docusaurus/theme-common'
import ClickHouseLogo from '../../icons/ClickHouseLogo'

const MobileSideBarMenuContents = ({ className, onClick, sidebar, path }) => {
  return (
    <div className={clsx(styles.docsMobileMenu, className)}>
      <div
        className={clsx("navbar-sidebar__brand", styles.docsMobileMenu_header)}>
        <ClickHouseLogo width={150} />
        <IconClose
          onClick={onClick}
        />
      </div>
      <div className={styles.searchBar}>
        <SearchBar />
      </div>
      <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list', styles.docsMobileMenuItems)}>
        <DocSidebarItems items={sidebar} activePath={path} level={1} onItemClick={onClick} />
      </ul>
    </div>
  );
}

export default MobileSideBarMenuContents;
