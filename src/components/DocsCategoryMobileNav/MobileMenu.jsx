import React, {useState} from 'react';
import styles from '../DocsCategoryMobileNav/styles.module.css'
import NavbarMobileSidebar from '../../theme/Navbar/MobileSidebar'
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal'
import IconClose from '@theme/Icon/Close';
import NavbarLogo from '@theme/Navbar/Logo';
import SearchBar from "@theme/SearchBar";
import clsx from 'clsx'
import DocSidebarItems from '@theme/DocSidebarItems'
import sidebars from '../../../sidebars'
import { ThemeClassNames } from '@docusaurus/theme-common'
import ClickHouseLogo from '../../icons/ClickHouseLogo'

const MobileMenu = ({className, onClick, path}) => {

  return(
    <div className={className}>
      <div
        className={clsx("navbar-sidebar__brand", styles.docsMobileMenu_header)}>
        <ClickHouseLogo width={150}/>
        <IconClose
          onClick={onClick}
        />
      </div>
      <SearchBar className={styles.searchBar}/>
      <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list', styles.docsMobileMenuItems)}>
        <DocSidebarItems items={sidebars.dropdownCategories} activePath={path} level={1}/>
      </ul>
    </div>
  );
}

export default MobileMenu;