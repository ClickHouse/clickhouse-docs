import React, {useState} from 'react';
import Hamburger from "./Hamburger";
import MobileSideBarMenuContents from './Content';
import styles from './styles.module.css';

const MobileSideBarMenu = ({sidebar}) => {
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
        sidebar={sidebar}
        className={currentMenuState
          ? styles.docsMobileMenuActive
          : styles.docsMobileMenuHidden}
      />
    </>
  );

}

export default MobileSideBarMenu;
