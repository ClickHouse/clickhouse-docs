import React from 'react';
import {
    useNavbarMobileSidebar,
} from '@docusaurus/theme-common/internal';
import Translate from '@docusaurus/Translate';
import SearchBar from "@theme/SearchBar";
import clsx from 'clsx'
import { ThemeClassNames } from '@docusaurus/theme-common'
import { useNavbarSecondaryMenu } from '@docusaurus/theme-common/internal';
import styles from './styles.module.css'
import DocSidebarItems from '@theme/DocSidebarItems'
import sidebars from '../../../../../sidebars';

function SecondaryMenuBackButton(props) {
    return (
        <button {...props} type="button" className="clean-btn navbar-sidebar__back">
            <Translate
                id="theme.navbar.mobileSidebarSecondaryMenu.backButtonLabel"
                description="The label of the back button to return to main menu, inside the mobile navbar sidebar secondary menu (notably used to display the docs sidebar)">
                ← Back to main menu
            </Translate>
        </button>
    );
}

// The secondary menu slides from the right and shows the top nav items. This is alittle unusual - we use this to show the drop down items
export default function NavbarMobileSidebarSecondaryMenu() {
  const secondaryMenu = useNavbarSecondaryMenu();
  const mobileSidebar = useNavbarMobileSidebar();

  return (
    <>
      <SecondaryMenuBackButton onClick={() => secondaryMenu.hide()} />
      <div className={clsx(styles.docsMobileMenu)}>
        <div className={styles.searchBar}>
          <SearchBar />
        </div>
      </div>
      <ul className={clsx(ThemeClassNames.docs.docSidebarMenu, 'menu__list', styles.docsMobileMenuItems)}>
        <DocSidebarItems items={sidebars.dropdownCategories.map(item => ({
          ...item,
          label: (
            <Translate id={`sidebar.dropdownCategories.category.${item.label}`}>
              {item.label}
            </Translate>
          ),
          items: item.items?.map(subItem => ({
            ...subItem,
            label: (
              <Translate id={`sidebar.dropdownCategories.category.${item.label}.${subItem.label}`}>
                {subItem.label}
              </Translate>
            )
          }))
        }))} activePath={'path'} level={1} onItemClick={() => mobileSidebar.toggle()} />
      </ul>
    </>
  );
}
