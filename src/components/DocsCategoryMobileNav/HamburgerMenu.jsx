import React, {useState} from 'react';

import Hamburger from "./Hamburger";
import MobileMenu from './MobileMenu'
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal'
import NavbarBackdrop from '../../theme/Navbar/Layout/index'
import styles from '../DocsCategoryMobileNav/styles.module.css'

function HamburgerMenu()
{

  const [currentMenuState, setMenuState] = useState(false);

  return(
    <>
      <Hamburger
        onClick={() => setMenuState(!currentMenuState)}
      />
      <div className={currentMenuState ? styles.docsMobileMenuBackdropActive : styles.docsMobileMenuBackdropInactive}/>
      <MobileMenu
        onClick={() => setMenuState(!currentMenuState)}
        className={currentMenuState
          ? styles.docsMobileMenuActive
          : styles.docsMobileMenuHidden}
      />
    </>
  );
}

export default HamburgerMenu;
