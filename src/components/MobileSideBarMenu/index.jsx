import React, {useState} from 'react';
import Hamburger from "./Hamburger";
import MobileSideBarMenuContents from './Content';
import styles from './styles.module.scss';

const MobileSideBarMenu = ({sidebar, menu}) => {
  const [currentMenuState, setMenuState] = useState(false);
  return(
    <>
      <Hamburger
        onClick={() => setMenuState(!currentMenuState)}
      />
      <div className={currentMenuState ? styles.docsMobileMenuBackdropActive : styles.docsMobileMenuBackdropInactive}/>
      <MobileSideBarMenuContents
        onClick={(item) => {
          if (!item.collapsible) {
            setMenuState(!currentMenuState)
          }
        }}
        sidebar={sidebar} // Left sidebar items
        menu={menu} // Top level menu items
        className={currentMenuState
          ? styles.docsMobileMenuActive
          : styles.docsMobileMenuHidden}
      />
    </>
  );

}

export default MobileSideBarMenu;
